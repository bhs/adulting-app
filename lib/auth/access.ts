/**
 * Route access decisions for the SSO gate.
 *
 * `middleware.ts` protects the calculator (and every other app route) by
 * combining two checks: (1) the visitor must be signed in through school SSO,
 * and (2) if the invite-only soft launch is active, their email must be on the
 * allow-list. This module holds that decision as a pure function so it can be
 * unit-tested without a running Next.js edge runtime, while the middleware
 * stays a thin translator from decision to `NextResponse`.
 */
import { isEmailAllowed } from '@/lib/access/allowlist'

/** Message returned when an authenticated user fails the soft-launch gate. */
export const SOFT_LAUNCH_FORBIDDEN_MESSAGE =
  'This soft launch is invite-only. Your email is not on the access list.'

/**
 * Paths that must stay reachable without a session: the login page itself, the
 * Auth.js endpoints that run the OAuth handshake, and the health check used by
 * container orchestration and deploy smoke tests.
 */
const PUBLIC_PREFIXES = ['/login', '/api/auth', '/api/health']

/** Whether a path is public (no authentication required). */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export type AccessDecision =
  | { type: 'allow' }
  | { type: 'redirect'; to: string }
  | { type: 'forbid'; reason: string }

/**
 * Decide what to do with a request.
 *
 * - Public path → always allowed.
 * - Not authenticated → redirect to the login page.
 * - Authenticated but blocked by the soft-launch allow-list → forbidden (403).
 * - Otherwise → allowed.
 *
 * The allow-list is passed in (rather than read from the environment here) so
 * the caller controls when it is parsed and the function stays pure.
 */
export function resolveAccess(params: {
  pathname: string
  isAuthenticated: boolean
  email?: string | null
  allowlist: string[]
}): AccessDecision {
  const { pathname, isAuthenticated, email, allowlist } = params

  if (isPublicPath(pathname)) return { type: 'allow' }
  if (!isAuthenticated) return { type: 'redirect', to: '/login' }
  if (!isEmailAllowed(email, allowlist)) {
    return { type: 'forbid', reason: SOFT_LAUNCH_FORBIDDEN_MESSAGE }
  }
  return { type: 'allow' }
}
