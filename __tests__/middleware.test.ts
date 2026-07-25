/**
 * @jest-environment node
 *
 * Integration tests for the soft-launch access middleware.
 *
 * The real middleware runs against real NextRequest objects; only the
 * SOFT_LAUNCH_ALLOWLIST environment variable is swapped between cases. This
 * exercises the actual header/cookie extraction, the env-driven gate, and the
 * 403 response shape without a running server.
 */
import { describe, it, expect, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

const ORIGINAL_ALLOWLIST = process.env.SOFT_LAUNCH_ALLOWLIST

afterEach(() => {
  if (ORIGINAL_ALLOWLIST === undefined) {
    delete process.env.SOFT_LAUNCH_ALLOWLIST
  } else {
    process.env.SOFT_LAUNCH_ALLOWLIST = ORIGINAL_ALLOWLIST
  }
})

/** Build a NextRequest for a path, optionally carrying an identifying email. */
function request(
  path: string,
  opts: { header?: string; cookie?: string } = {}
): NextRequest {
  const headers = new Headers()
  if (opts.header) headers.set('x-user-email', opts.header)
  if (opts.cookie) headers.set('cookie', `soft_launch_email=${opts.cookie}`)
  return new NextRequest(`https://adulting-app.onrender.com${path}`, {
    headers,
  })
}

describe('soft-launch middleware', () => {
  it('lets every request through when no allowlist is configured', () => {
    delete process.env.SOFT_LAUNCH_ALLOWLIST
    const res = middleware(request('/dashboard'))
    expect(res.status).toBe(200)
  })

  it('allows a tester whose header email is on the list', () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(
      request('/dashboard', { header: 'Tester@Example.com' })
    )
    expect(res.status).toBe(200)
  })

  it('allows a tester identified by the soft_launch_email cookie', () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(
      request('/dashboard', { cookie: 'tester@example.com' })
    )
    expect(res.status).toBe(200)
  })

  it('blocks a request with no email once the gate is active', async () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(request('/dashboard'))
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      error:
        'This soft launch is invite-only. Your email is not on the access list.',
    })
  })

  it('blocks an email that is not on the list', () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(
      request('/dashboard', { header: 'stranger@evil.com' })
    )
    expect(res.status).toBe(403)
  })
})
