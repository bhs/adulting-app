import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/edge'
import { parseAllowlist } from '@/lib/access/allowlist'
import { resolveAccess } from '@/lib/auth/access'

/**
 * Protect the calculator (and every other app route) behind school SSO.
 *
 * The handler is wrapped with Auth.js's `auth()` so `request.auth` carries the
 * signed-in session (or null). The actual decision lives in the pure
 * `resolveAccess` helper, which layers two gates:
 *
 *   1. Authentication — unauthenticated visitors are redirected to `/login`,
 *      carrying the originally requested path as `callbackUrl` so they land
 *      back where they started after signing in.
 *   2. Soft-launch allow-list — during the invite-only launch, an authenticated
 *      user whose email is not on SOFT_LAUNCH_ALLOWLIST gets a 403. The list is
 *      read at request time so the Render dashboard can grow the cohort — or
 *      lift the gate entirely (empty list) — without a redeploy.
 *
 * Public paths (login, the Auth.js endpoints, the health check) fall through
 * untouched; see `isPublicPath` in `lib/auth/access.ts`.
 */
export default auth((request) => {
  const decision = resolveAccess({
    pathname: request.nextUrl.pathname,
    isAuthenticated: Boolean(request.auth),
    email: request.auth?.user?.email,
    allowlist: parseAllowlist(process.env.SOFT_LAUNCH_ALLOWLIST),
  })

  if (decision.type === 'redirect') {
    const loginUrl = new URL(decision.to, request.nextUrl.origin)
    loginUrl.searchParams.set(
      'callbackUrl',
      request.nextUrl.pathname + request.nextUrl.search
    )
    return NextResponse.redirect(loginUrl)
  }

  if (decision.type === 'forbid') {
    return NextResponse.json({ error: decision.reason }, { status: 403 })
  }

  return NextResponse.next()
})

export const config = {
  // Apply the gate to app traffic, but leave static assets and Next internals
  // open. The health check and the Auth.js endpoints are matched here but
  // treated as public by `resolveAccess`, so they still pass through.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
