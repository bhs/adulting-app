import { NextResponse, type NextRequest } from 'next/server'
import { isEmailAllowed, parseAllowlist } from '@/lib/access/allowlist'

/**
 * Identify the tester behind a request during the soft launch. The cohort is
 * recognized either by an `x-user-email` header (set by the upstream auth
 * proxy) or a `soft_launch_email` cookie written when a tester follows their
 * invite link. Returns undefined when neither is present.
 */
function requestEmail(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-user-email') ??
    request.cookies.get('soft_launch_email')?.value ??
    undefined
  )
}

/**
 * Gate application traffic behind the soft-launch email allow-list. The list is
 * read from SOFT_LAUNCH_ALLOWLIST at request time so the Render dashboard can
 * grow the cohort — or lift the gate entirely — without a redeploy. Requests
 * that fail the gate get a 403; everything else falls through untouched.
 */
export function middleware(request: NextRequest): NextResponse {
  const allowlist = parseAllowlist(process.env.SOFT_LAUNCH_ALLOWLIST)

  if (isEmailAllowed(requestEmail(request), allowlist)) {
    return NextResponse.next()
  }

  return NextResponse.json(
    {
      error:
        'This soft launch is invite-only. Your email is not on the access list.',
    },
    { status: 403 }
  )
}

export const config = {
  // Apply the gate to app traffic, but leave the health check, static assets,
  // and Next internals open so deploy smoke tests and the CDN keep working.
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico).*)'],
}
