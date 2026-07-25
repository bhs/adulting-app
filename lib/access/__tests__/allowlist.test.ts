import { describe, it, expect } from '@jest/globals'
import {
  parseAllowlist,
  isAllowlistEnabled,
  isEmailAllowed,
} from '../allowlist'

describe('parseAllowlist', () => {
  it('returns an empty list for undefined, null, or empty input', () => {
    expect(parseAllowlist(undefined)).toEqual([])
    expect(parseAllowlist(null)).toEqual([])
    expect(parseAllowlist('')).toEqual([])
    expect(parseAllowlist('   ')).toEqual([])
  })

  it('splits on commas, trimming and lower-casing each entry', () => {
    expect(parseAllowlist('A@B.com, c@d.com ,  E@F.com')).toEqual([
      'a@b.com',
      'c@d.com',
      'e@f.com',
    ])
  })

  it('drops blank entries from stray or trailing commas', () => {
    expect(parseAllowlist('a@b.com,,, ,c@d.com,')).toEqual([
      'a@b.com',
      'c@d.com',
    ])
  })
})

describe('isAllowlistEnabled', () => {
  it('is disabled when the list is empty and enabled otherwise', () => {
    expect(isAllowlistEnabled([])).toBe(false)
    expect(isAllowlistEnabled(['a@b.com'])).toBe(true)
  })
})

describe('isEmailAllowed', () => {
  it('allows everyone when the gate is disabled (empty list)', () => {
    expect(isEmailAllowed('anyone@example.com', [])).toBe(true)
    expect(isEmailAllowed(undefined, [])).toBe(true)
    expect(isEmailAllowed(null, [])).toBe(true)
  })

  it('allows an email on the list, case- and whitespace-insensitively', () => {
    const list = parseAllowlist('tester@example.com')
    expect(isEmailAllowed('tester@example.com', list)).toBe(true)
    expect(isEmailAllowed('  TESTER@Example.COM  ', list)).toBe(true)
  })

  it('denies an email that is not on an active list', () => {
    const list = parseAllowlist('tester@example.com')
    expect(isEmailAllowed('stranger@example.com', list)).toBe(false)
  })

  it('denies a request with no email once the gate is active', () => {
    const list = parseAllowlist('tester@example.com')
    expect(isEmailAllowed(undefined, list)).toBe(false)
    expect(isEmailAllowed(null, list)).toBe(false)
    expect(isEmailAllowed('', list)).toBe(false)
  })
})
