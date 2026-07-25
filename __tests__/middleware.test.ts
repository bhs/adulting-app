/**
 * @jest-environment node
 *
 * Integration tests for the SSO access middleware.
 *
 * Identity now comes from the Auth.js session (`request.auth`) rather than a
 * header/cookie. We stub the edge `auth()` wrapper with an identity function so
 * the wrapped handler is testable directly, then drive it with real NextRequest
 * objects carrying a synthetic session. This exercises the real
 * public-path / redirect / soft-launch-403 decision and the response shapes it
 * produces, without a running Auth.js runtime.
 */
import { describe, it, expect, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'

// Replace the edge Auth.js instance with an identity wrapper so `middleware`
// (its default export) is just the decision handler we can call directly.
jest.mock('@/lib/auth/edge', () => ({
  auth: (handler: unknown) => handler,
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const middleware = require('@/middleware').default as (
  req: NextRequest
) => Response

const ORIGINAL_ALLOWLIST = process.env.SOFT_LAUNCH_ALLOWLIST

afterEach(() => {
  if (ORIGINAL_ALLOWLIST === undefined) {
    delete process.env.SOFT_LAUNCH_ALLOWLIST
  } else {
    process.env.SOFT_LAUNCH_ALLOWLIST = ORIGINAL_ALLOWLIST
  }
})

/** Build a NextRequest for a path, optionally attaching a signed-in session. */
function request(
  path: string,
  session?: { user?: { email?: string | null } } | null
): NextRequest {
  const req = new NextRequest(`https://adulting-app.onrender.com${path}`)
  ;(req as unknown as { auth: unknown }).auth = session ?? null
  return req
}

describe('SSO middleware', () => {
  it('lets unauthenticated requests reach public paths (health check)', () => {
    const res = middleware(request('/api/health'))
    expect(res.status).toBe(200)
  })

  it('redirects an unauthenticated visitor on a protected path to /login', () => {
    const res = middleware(request('/dashboard'))
    expect(res.status).toBe(307)
    const location = res.headers.get('location')!
    expect(location).toContain('/login')
    // The originally requested path is preserved for post-login return.
    expect(location).toContain('callbackUrl=%2Fdashboard')
  })

  it('allows any authenticated user when no allowlist is configured', () => {
    delete process.env.SOFT_LAUNCH_ALLOWLIST
    const res = middleware(
      request('/dashboard', { user: { email: 'anyone@school.edu' } })
    )
    expect(res.status).toBe(200)
  })

  it('allows an authenticated user whose email is on the soft-launch list', () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(
      request('/dashboard', { user: { email: 'Tester@Example.com' } })
    )
    expect(res.status).toBe(200)
  })

  it('blocks an authenticated user not on the soft-launch list with a 403', async () => {
    process.env.SOFT_LAUNCH_ALLOWLIST = 'tester@example.com'
    const res = middleware(
      request('/dashboard', { user: { email: 'stranger@evil.com' } })
    )
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({
      error:
        'This soft launch is invite-only. Your email is not on the access list.',
    })
  })
})
