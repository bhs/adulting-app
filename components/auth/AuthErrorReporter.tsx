'use client'

import { useEffect } from 'react'
import { trackSsoLoginFailure } from '@/lib/auth/telemetry'

/**
 * Surfaces a failed SSO login on the /login page.
 *
 * Auth.js redirects a failed or aborted sign-in back to the login page with an
 * `?error=` query parameter. This client component renders an accessible alert
 * and records the `sso_login_failure` span event to Honeycomb exactly once per
 * failure. Rendering nothing when there is no error keeps the happy path clean.
 */
interface AuthErrorReporterProps {
  error?: string
  provider?: string
}

export function AuthErrorReporter({ error, provider }: AuthErrorReporterProps) {
  useEffect(() => {
    if (error) {
      trackSsoLoginFailure({ error, provider })
    }
  }, [error, provider])

  if (!error) return null

  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      We couldn&apos;t sign you in. Please try again, or contact your
      school&apos;s IT administrator if the problem continues.
    </p>
  )
}
