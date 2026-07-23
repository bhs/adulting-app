/**
 * @jest-environment node
 *
 * Integration tests for the /api/users route handlers.
 *
 * This is the app's one data-persistence flow (list users, create a user).
 * The handlers run for real; only the Prisma client's data-access methods are
 * spied on, so the tests exercise the handlers' actual request parsing,
 * validation, status codes, response serialization, and error handling
 * without needing a live PostgreSQL database. The assertions cover both the
 * happy paths and the failure modes the code deliberately handles: a missing
 * required field (400) and a datastore error bubbling up (500).
 *
 * We spy on the shared prisma singleton (rather than jest.mock the module) so
 * the route's own import and the test observe the exact same instance.
 */
import { describe, it, expect, afterEach, jest } from '@jest/globals'
import { prisma } from '@/lib/prisma'
import { GET, POST } from '../route'

/** Build a minimal Request whose json() resolves to the given body. */
function jsonRequest(body: unknown): Request {
  return { json: async () => body } as unknown as Request
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('GET /api/users', () => {
  it('returns all users with their posts included', async () => {
    const users = [
      {
        id: 'u1',
        email: 'a@example.com',
        name: 'A',
        posts: [{ id: 'p1', title: 'Hi' }],
      },
      { id: 'u2', email: 'b@example.com', name: null, posts: [] },
    ]
    const findMany = jest
      .spyOn(prisma.user, 'findMany')
      .mockResolvedValue(users as never)

    const res = await GET()

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(users)
    // The route eagerly loads the posts relation.
    expect(findMany).toHaveBeenCalledWith({ include: { posts: true } })
  })

  it('returns 500 with an error message when the datastore throws', async () => {
    jest
      .spyOn(prisma.user, 'findMany')
      .mockRejectedValue(new Error('connection refused') as never)

    const res = await GET()

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      error: 'Failed to fetch users',
    })
  })
})

describe('POST /api/users', () => {
  it('creates a user and returns 201 with the created record', async () => {
    const created = { id: 'u3', email: 'new@example.com', name: 'New' }
    const create = jest
      .spyOn(prisma.user, 'create')
      .mockResolvedValue(created as never)

    const res = await POST(
      jsonRequest({ email: 'new@example.com', name: 'New' })
    )

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toEqual(created)
    expect(create).toHaveBeenCalledWith({
      data: { email: 'new@example.com', name: 'New' },
    })
  })

  it('creates a user when name is omitted (name is optional)', async () => {
    const created = { id: 'u4', email: 'noname@example.com', name: null }
    const create = jest
      .spyOn(prisma.user, 'create')
      .mockResolvedValue(created as never)

    const res = await POST(jsonRequest({ email: 'noname@example.com' }))

    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledWith({
      data: { email: 'noname@example.com', name: undefined },
    })
  })

  it('rejects a request with no email as 400 and never touches the datastore', async () => {
    const create = jest.spyOn(prisma.user, 'create')

    const res = await POST(jsonRequest({ name: 'No Email' }))

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Email is required' })
    expect(create).not.toHaveBeenCalled()
  })

  it('returns 500 when the create call throws (e.g. unique-constraint violation)', async () => {
    jest
      .spyOn(prisma.user, 'create')
      .mockRejectedValue(
        new Error('unique constraint failed on email') as never
      )

    const res = await POST(
      jsonRequest({ email: 'dupe@example.com', name: 'Dupe' })
    )

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      error: 'Failed to create user',
    })
  })

  it('returns 500 when the request body is not valid JSON', async () => {
    // request.json() rejecting simulates a malformed body; the catch-all
    // handler should convert it to a 500 rather than letting it throw.
    const badReq = {
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    } as unknown as Request

    const res = await POST(badReq)

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      error: 'Failed to create user',
    })
  })
})
