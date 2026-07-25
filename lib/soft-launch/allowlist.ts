/**
 * Soft-launch access gating.
 *
 * The production launch is rolled out to a small cohort first. The cohort is
 * expressed as an email allow-list carried in the `SOFT_LAUNCH_ALLOWLIST`
 * environment variable, which the Render Terraform module injects into the web
 * service's config (see `terraform/main.tf`). Keeping the cohort in an env var
 * — rather than the database — means the allow-list is versioned alongside the
 * infrastructure and a `terraform apply` is all it takes to widen or narrow the
 * launch.
 *
 * Allow-list grammar (entries separated by commas, whitespace, or newlines):
 *   - `alice@example.com` — an exact address (matched case-insensitively)
 *   - `*@example.com`     — any address at that domain
 *   - `*`                 — everyone (general availability / open launch)
 *
 * An empty or unset allow-list is a *closed* launch: nobody is admitted. This
 * fail-closed default keeps an un-provisioned service from leaking access.
 */

/** The environment variable that carries the cohort allow-list. */
export const ALLOWLIST_ENV_VAR = 'SOFT_LAUNCH_ALLOWLIST'

/** How wide the current launch is, derived from the parsed allow-list. */
export type LaunchMode = 'open' | 'restricted' | 'closed'

/** Minimal shape of an environment map we read the allow-list from. */
export type EnvSource = Record<string, string | undefined>

/**
 * Parse the raw allow-list string into a normalized list of entries.
 *
 * Entries are lower-cased and trimmed, blank entries are dropped, and
 * duplicates are removed while preserving first-seen order. Both commas and
 * any whitespace (spaces, tabs, newlines) act as separators, so the same value
 * works whether it is set inline or as a multi-line secret.
 */
export function parseAllowlist(raw: string | undefined | null): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  const entries: string[] = []
  for (const token of raw.split(/[\s,]+/)) {
    const entry = token.trim().toLowerCase()
    if (!entry || seen.has(entry)) continue
    seen.add(entry)
    entries.push(entry)
  }
  return entries
}

/** Classify how wide a launch the given (already parsed) allow-list describes. */
export function launchMode(allowlist: string[]): LaunchMode {
  if (allowlist.includes('*')) return 'open'
  if (allowlist.length === 0) return 'closed'
  return 'restricted'
}

/**
 * Decide whether `email` is admitted by `allowlist`.
 *
 * `allowlist` is expected to already be normalized (i.e. the output of
 * {@link parseAllowlist}); the candidate email is normalized here so callers
 * can pass raw user input.
 */
export function isAllowed(
  email: string | undefined | null,
  allowlist: string[]
): boolean {
  // A wildcard opens the launch to everyone, even anonymous callers.
  if (allowlist.includes('*')) return true

  const normalized = (email ?? '').trim().toLowerCase()
  if (!normalized) return false

  if (allowlist.includes(normalized)) return true

  // Domain wildcard, e.g. `*@example.com`.
  const at = normalized.lastIndexOf('@')
  if (at === -1) return false
  const domain = normalized.slice(at + 1)
  if (!domain) return false
  return allowlist.includes(`*@${domain}`)
}

/**
 * Read and parse the allow-list from the process environment.
 *
 * Reads {@link ALLOWLIST_ENV_VAR} on every call so a re-deploy that changes the
 * env var takes effect without a code change; the parsing is cheap.
 */
export function getAllowlist(env: EnvSource = process.env): string[] {
  return parseAllowlist(env[ALLOWLIST_ENV_VAR])
}

/** The result of evaluating a candidate email against the current cohort. */
export interface AccessDecision {
  email: string | null
  allowed: boolean
  mode: LaunchMode
}

/**
 * Evaluate a candidate email against the allow-list currently configured in the
 * environment. This is the single entry point the request handlers use.
 */
export function checkAccess(
  email: string | undefined | null,
  env: EnvSource = process.env
): AccessDecision {
  const allowlist = getAllowlist(env)
  const normalized = (email ?? '').trim().toLowerCase() || null
  return {
    email: normalized,
    allowed: isAllowed(email, allowlist),
    mode: launchMode(allowlist),
  }
}
