/**
 * Unit tests for the soft-launch allow-list gating.
 *
 * The allow-list is the security boundary for the production soft launch, so
 * these tests pin down every branch of the grammar (exact address, domain
 * wildcard, global wildcard), the normalization rules (case, whitespace,
 * dedupe), and — most importantly — the fail-closed default when the cohort is
 * unset. `checkAccess` is also exercised end-to-end against a fake environment
 * so the request handler's single entry point is covered.
 */
import { describe, it, expect } from '@jest/globals'
import {
  ALLOWLIST_ENV_VAR,
  parseAllowlist,
  launchMode,
  isAllowed,
  getAllowlist,
  checkAccess,
} from '../allowlist'

describe('parseAllowlist', () => {
  it('returns an empty list for unset/blank input', () => {
    expect(parseAllowlist(undefined)).toEqual([])
    expect(parseAllowlist(null)).toEqual([])
    expect(parseAllowlist('')).toEqual([])
    expect(parseAllowlist('   \n\t ')).toEqual([])
  })

  it('splits on commas and any whitespace, and lower-cases entries', () => {
    expect(
      parseAllowlist('Alice@Example.com, bob@example.com\nCAROL@EXAMPLE.COM')
    ).toEqual(['alice@example.com', 'bob@example.com', 'carol@example.com'])
  })

  it('trims surrounding whitespace and drops empty entries', () => {
    expect(parseAllowlist('  a@x.com ,, ,  b@x.com  ')).toEqual([
      'a@x.com',
      'b@x.com',
    ])
  })

  it('removes duplicates while preserving first-seen order', () => {
    expect(parseAllowlist('a@x.com, b@x.com, A@X.com, b@x.com')).toEqual([
      'a@x.com',
      'b@x.com',
    ])
  })
})

describe('launchMode', () => {
  it('is closed when the allow-list is empty', () => {
    expect(launchMode([])).toBe('closed')
  })

  it('is restricted when specific entries are present', () => {
    expect(launchMode(['a@x.com'])).toBe('restricted')
    expect(launchMode(['*@x.com'])).toBe('restricted')
  })

  it('is open when a global wildcard is present', () => {
    expect(launchMode(['*'])).toBe('open')
    expect(launchMode(['a@x.com', '*'])).toBe('open')
  })
})

describe('isAllowed', () => {
  const cohort = parseAllowlist('alice@example.com, *@partner.com')

  it('admits an exact address regardless of case/whitespace', () => {
    expect(isAllowed('alice@example.com', cohort)).toBe(true)
    expect(isAllowed('  ALICE@Example.com ', cohort)).toBe(true)
  })

  it('admits any address at a wildcarded domain', () => {
    expect(isAllowed('anyone@partner.com', cohort)).toBe(true)
    expect(isAllowed('Anyone@Partner.com', cohort)).toBe(true)
  })

  it('rejects an address that is not listed', () => {
    expect(isAllowed('mallory@example.com', cohort)).toBe(false)
    expect(isAllowed('alice@partner.org', cohort)).toBe(false)
  })

  it('does not treat a domain match as a substring match', () => {
    // `*@partner.com` must not admit `evil-partner.com` or `partner.com.evil`.
    expect(isAllowed('x@evil-partner.com', cohort)).toBe(false)
    expect(isAllowed('x@partner.com.evil', cohort)).toBe(false)
  })

  it('fails closed for empty/malformed emails', () => {
    expect(isAllowed(undefined, cohort)).toBe(false)
    expect(isAllowed(null, cohort)).toBe(false)
    expect(isAllowed('', cohort)).toBe(false)
    expect(isAllowed('not-an-email', cohort)).toBe(false)
    expect(isAllowed('@partner.com', cohort)).toBe(true) // still a partner.com address
  })

  it('admits everyone (including anonymous) when the list has a global wildcard', () => {
    const open = parseAllowlist('*')
    expect(isAllowed('whoever@anywhere.com', open)).toBe(true)
    expect(isAllowed(undefined, open)).toBe(true)
    expect(isAllowed('', open)).toBe(true)
  })

  it('admits nobody when the allow-list is empty (fail closed)', () => {
    expect(isAllowed('alice@example.com', [])).toBe(false)
  })
})

describe('getAllowlist', () => {
  it('reads and parses from the provided environment', () => {
    expect(getAllowlist({ [ALLOWLIST_ENV_VAR]: 'a@x.com, b@x.com' })).toEqual([
      'a@x.com',
      'b@x.com',
    ])
  })

  it('returns an empty list when the env var is unset', () => {
    expect(getAllowlist({})).toEqual([])
  })
})

describe('checkAccess', () => {
  it('reports allowed with normalized email and mode for a listed user', () => {
    const env = { [ALLOWLIST_ENV_VAR]: 'alice@example.com' }
    expect(checkAccess('  Alice@Example.com ', env)).toEqual({
      email: 'alice@example.com',
      allowed: true,
      mode: 'restricted',
    })
  })

  it('reports not-allowed for an unlisted user', () => {
    const env = { [ALLOWLIST_ENV_VAR]: 'alice@example.com' }
    expect(checkAccess('bob@example.com', env)).toEqual({
      email: 'bob@example.com',
      allowed: false,
      mode: 'restricted',
    })
  })

  it('denies everyone and reports closed mode when unconfigured', () => {
    expect(checkAccess('alice@example.com', {})).toEqual({
      email: 'alice@example.com',
      allowed: false,
      mode: 'closed',
    })
  })

  it('reports open mode and a null email for an anonymous open-launch check', () => {
    expect(checkAccess(undefined, { [ALLOWLIST_ENV_VAR]: '*' })).toEqual({
      email: null,
      allowed: true,
      mode: 'open',
    })
  })
})
