/**
 * School SSO provider configuration.
 *
 * We cover the two largest school identity ecosystems — Google Workspace for
 * Education and Microsoft Entra ID (formerly Azure AD) — through Auth.js's
 * built-in OAuth/OIDC providers. Each provider is only wired up when its
 * credentials are present in the environment (managed in the Render dashboard),
 * so a school can enable just one ecosystem or both.
 *
 * The functions here are deliberately free of any `next-auth` import: they read
 * and validate the raw environment into plain credential objects. `config.ts`
 * feeds those objects to the actual provider factories. Keeping the env logic
 * isolated makes it unit-testable without pulling the Auth.js ESM runtime into
 * the test process.
 */

/** Provider ids as understood by Auth.js `signIn()` and the account records. */
export type SsoProviderId = 'google' | 'microsoft-entra-id'

export interface GoogleCredentials {
  clientId: string
  clientSecret: string
}

export interface EntraCredentials {
  clientId: string
  clientSecret: string
  /** Fully-qualified OIDC issuer for the school's Entra tenant. */
  issuer: string
}

/** UI-facing descriptor used by the /login page and its tests. */
export interface SsoProviderDescriptor {
  id: SsoProviderId
  label: string
}

/** The buttons offered on the login page, in display order. */
export const SSO_PROVIDERS: readonly SsoProviderDescriptor[] = [
  { id: 'google', label: 'Sign in with Google' },
  { id: 'microsoft-entra-id', label: 'Sign in with Microsoft' },
]

type Env = Record<string, string | undefined>

/**
 * Build the OIDC issuer URL for a Microsoft Entra tenant. Using the tenant's
 * v2.0 issuer (rather than the multi-tenant `common` endpoint) scopes logins to
 * the school's own directory.
 */
export function entraIssuer(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}/v2.0`
}

/**
 * Google Workspace credentials, or null when the provider is not configured.
 * Both the client id and secret must be present for the provider to be usable.
 */
export function googleCredentials(
  env: Env = process.env
): GoogleCredentials | null {
  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

/**
 * Microsoft Entra ID credentials, or null when the provider is not configured.
 * Entra additionally requires the directory (tenant) id to build the issuer.
 */
export function entraCredentials(
  env: Env = process.env
): EntraCredentials | null {
  const clientId = env.AZURE_AD_CLIENT_ID
  const clientSecret = env.AZURE_AD_CLIENT_SECRET
  const tenantId = env.AZURE_AD_TENANT_ID
  if (!clientId || !clientSecret || !tenantId) return null
  return { clientId, clientSecret, issuer: entraIssuer(tenantId) }
}

/**
 * The provider ids that are fully configured in the current environment. Handy
 * for health checks and for deciding whether the app has any working SSO path.
 */
export function configuredProviderIds(env: Env = process.env): SsoProviderId[] {
  const ids: SsoProviderId[] = []
  if (googleCredentials(env)) ids.push('google')
  if (entraCredentials(env)) ids.push('microsoft-entra-id')
  return ids
}
