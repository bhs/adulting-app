/**
 * Soft-launch email allow-list.
 *
 * During the soft launch we gate the app to a small cohort of invited testers.
 * The permitted emails are supplied through the SOFT_LAUNCH_ALLOWLIST
 * environment variable as a comma-separated string and enforced in
 * `middleware.ts`. Environment variables are managed in the Render dashboard
 * (or via the Render API) and injected at runtime, so the cohort can be grown
 * or the gate lifted without a code change.
 *
 * When the variable is empty or unset the gate is disabled and every request
 * is allowed through — this keeps local development, CI, and the eventual
 * general-availability launch open by default.
 */

/**
 * Parse the raw SOFT_LAUNCH_ALLOWLIST value into a normalized list of emails.
 * Entries are trimmed, lower-cased, and de-blanked so comparison is
 * case-insensitive and forgiving of stray whitespace ("A@B.com, c@d.com ").
 */
export function parseAllowlist(raw: string | undefined | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Whether the gate is active. An empty list means "no gate": the soft launch
 * has either not started or has been lifted, and all traffic is allowed.
 */
export function isAllowlistEnabled(allowlist: string[]): boolean {
  return allowlist.length > 0
}

/**
 * Decide whether a request identified by `email` may pass the gate.
 *
 * - Gate disabled (empty allowlist) → always allowed.
 * - Gate enabled but no email on the request → denied.
 * - Gate enabled → allowed only when the email is on the list.
 *
 * Comparison mirrors {@link parseAllowlist}: trimmed and case-insensitive.
 */
export function isEmailAllowed(
  email: string | undefined | null,
  allowlist: string[]
): boolean {
  if (allowlist.length === 0) return true
  if (!email) return false
  return allowlist.includes(email.trim().toLowerCase())
}
