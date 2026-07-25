/**
 * Shared, edge-safe Auth.js configuration.
 *
 * This object is consumed twice: once by `lib/auth/edge.ts` (used from
 * `middleware.ts`, which runs in the Edge runtime and therefore cannot touch
 * Prisma) and once by the root `auth.ts` (which adds the Prisma adapter for the
 * Node route handler). Keeping the providers, custom pages, and event
 * instrumentation here — with no adapter and no database import — lets both
 * entry points share exactly the same login behavior.
 */
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'
import { entraCredentials, googleCredentials } from './providers'
import { trackSsoLoginSuccess } from './telemetry'

/**
 * Instantiate only the providers whose credentials are present. A school that
 * uses Google Workspace but not Entra (or vice versa) simply leaves the other
 * provider's environment variables unset.
 */
function buildProviders(): NextAuthConfig['providers'] {
  const providers: NextAuthConfig['providers'] = []

  const google = googleCredentials()
  if (google) {
    providers.push(
      Google({ clientId: google.clientId, clientSecret: google.clientSecret })
    )
  }

  const entra = entraCredentials()
  if (entra) {
    providers.push(
      MicrosoftEntraID({
        clientId: entra.clientId,
        clientSecret: entra.clientSecret,
        issuer: entra.issuer,
      })
    )
  }

  return providers
}

export const authConfig = {
  providers: buildProviders(),
  // Route sign-in through our own Tailwind-styled page instead of the Auth.js
  // default. `middleware.ts` performs the actual route protection.
  pages: {
    signIn: '/login',
  },
  events: {
    // Fires after a successful sign-in (new or returning). Recorded to
    // Honeycomb as the sso_login_success span event.
    signIn({ user, account }) {
      trackSsoLoginSuccess({
        userId: user?.id,
        email: user?.email ?? undefined,
        provider: account?.provider,
      })
    },
  },
} satisfies NextAuthConfig
