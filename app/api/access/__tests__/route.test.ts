/**
 * @jest-environment node
 *
 * Integration tests for the /api/access soft-launch gate route handlers.
 *
 * The handlers run for real against a temporarily-overridden
 * `SOFT_LAUNCH_ALLOWLIST` env var, so these tests cover the actual request
 * parsing (query string for GET, JSON body for POST), the decision payload, and
 * the failure modes: a malformed POST body (400) and — importantly — the
 * fail-closed behavior when the cohort is unconfigured.
 */
import { describe, it, expect, afterEach } from '@jest/globals'
import { ALLOWLIST_ENV_VAR } from '@/lib/soft-launch/allowlist'
import { GET, POST } from '../route'

const originalAllowlist = process.env[ALLOWLIST_ENV_VAR]

afterEach(() => {
  if (originalAllowlist === undefined) {
    delete process.env[ALLOWLIST_ENV_VAR]
  } else {
    process.env[ALLOWLIST_ENV_VAR] = originalAllowlist
  }
})

/** Build a GET Request for the access route with the given query email. */
function getRequest(email?: string): Request {
  const url = new URL('http://localhost/api/access')
  if (email !== undefined) url.searchParams.set('email', email)
  return new Request(url)
}

/** Build a POST Request whose json() resolves to the given body. */
function jsonRequest(body: unknown): Request {
  return { json: async () => body } as unknown as Request
}

describe('GET /api/access', () => {
  it('admits a listed email and reports restricted mode', async () => {
    process.env[ALLOWLIST_ENV_VAR] = 'alice@example.com, *@partner.com'

    const res = await GET(getRequest('Alice@Example.com'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      email: 'alice@example.com',
      allowed: true,
      mode: 'restricted',
    })
  })

  it('rejects an unlisted email', async () => {
    process.env[ALLOWLIST_ENV_VAR] = 'alice@example.com'

    const res = await GET(getRequest('mallory@example.com'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      email: 'mallory@example.com',
      allowed: false,
      mode: 'restricted',
    })
  })

  it('fails closed when the allow-list is unconfigured', async () => {
    delete process.env[ALLOWLIST_ENV_VAR]

    const res = await GET(getRequest('alice@example.com'))

    await expect(res.json()).resolves.toEqual({
      email: 'alice@example.com',
      allowed: false,
      mode: 'closed',
    })
  })

  it('admits everyone once the launch is opened with a wildcard', async () => {
    process.env[ALLOWLIST_ENV_VAR] = '*'

    const res = await GET(getRequest('whoever@anywhere.com'))

    await expect(res.json()).resolves.toEqual({
      email: 'whoever@anywhere.com',
      allowed: true,
      mode: 'open',
    })
  })
})

describe('POST /api/access', () => {
  it('admits a listed email from the JSON body', async () => {
    process.env[ALLOWLIST_ENV_VAR] = 'alice@example.com'

    const res = await POST(jsonRequest({ email: 'alice@example.com' }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      email: 'alice@example.com',
      allowed: true,
      mode: 'restricted',
    })
  })

  it('treats a missing email as an anonymous (denied) check', async () => {
    process.env[ALLOWLIST_ENV_VAR] = 'alice@example.com'

    const res = await POST(jsonRequest({}))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      email: null,
      allowed: false,
      mode: 'restricted',
    })
  })

  it('returns 400 when the body is not valid JSON', async () => {
    const badReq = {
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    } as unknown as Request

    const res = await POST(badReq)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Invalid request body' })
  })
})
