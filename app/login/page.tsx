import { signIn } from '@/auth'
import { AuthErrorReporter } from '@/components/auth/AuthErrorReporter'
import {
  ProviderButton,
  type SsoProvider,
} from '@/components/auth/ProviderButton'
import {
  SSO_PROVIDERS,
  configuredProviderIds,
  type SsoProviderId,
} from '@/lib/auth/providers'

export const metadata = {
  title: 'Sign in · Adulting',
}

/** Map the Auth.js provider id to the ProviderButton's brand-mark variant. */
const BRAND: Record<SsoProviderId, SsoProvider> = {
  google: 'google',
  'microsoft-entra-id': 'microsoft',
}

/**
 * School SSO login page.
 *
 * Offers "Sign in with Google" and "Sign in with Microsoft" buttons that kick
 * off the OAuth/OIDC handshake via Auth.js server actions. Unauthenticated
 * visitors to any protected route are redirected here by `middleware.ts`, which
 * passes along a `callbackUrl` so we return them to where they started. A
 * failed sign-in comes back with `?error=`, which `AuthErrorReporter` turns
 * into an accessible alert and a `sso_login_failure` telemetry event.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; callbackUrl?: string }
}) {
  const callbackUrl = searchParams?.callbackUrl ?? '/'
  const error = searchParams?.error

  // Show a button per provider the school has configured. If none are wired up
  // yet (e.g. a fresh demo without credentials), fall back to showing both so
  // the sign-in UI is still demonstrable.
  const configured = configuredProviderIds()
  const visible = SSO_PROVIDERS.filter(
    (provider) => configured.length === 0 || configured.includes(provider.id)
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">
            Sign in with your school account to access your budget.
          </p>
        </div>

        <AuthErrorReporter error={error} />

        <div className="space-y-3">
          {visible.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                'use server'
                await signIn(provider.id, { redirectTo: callbackUrl })
              }}
            >
              <ProviderButton
                provider={BRAND[provider.id]}
                label={provider.label}
              />
            </form>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">
          Only Google Workspace and Microsoft Entra ID accounts provisioned by
          your school can sign in.
        </p>
      </div>
    </main>
  )
}
