/**
 * Unit tests for the shared utility helpers in lib/utils.ts.
 *
 * These are small, pure functions used pervasively across the UI (className
 * composition and human-readable dates), so a regression here shows up
 * everywhere. The tests are table-driven to make the covered cases — happy
 * path, falsy filtering, and string/Date input parity — explicit.
 */
import { describe, it, expect } from '@jest/globals'
import { cn, formatDate } from '../utils'

describe('cn', () => {
  // Each row: [description, input classes, expected output]
  const cases: Array<[string, (string | undefined | null | false)[], string]> =
    [
      ['joins plain class names with a single space', ['a', 'b', 'c'], 'a b c'],
      ['drops undefined values', ['a', undefined, 'b'], 'a b'],
      ['drops null values', ['a', null, 'b'], 'a b'],
      [
        'drops false values from short-circuited conditionals',
        ['a', false, 'b'],
        'a b',
      ],
      ['drops empty strings', ['a', '', 'b'], 'a b'],
      [
        'returns an empty string when nothing is truthy',
        [undefined, null, false, ''],
        '',
      ],
      ['returns an empty string when called with no arguments', [], ''],
      ['preserves a single class untouched', ['btn-primary'], 'btn-primary'],
    ]

  it.each(cases)('%s', (_desc, input, expected) => {
    expect(cn(...input)).toBe(expected)
  })

  it('supports the conditional-class idiom used in components', () => {
    const isActive = true
    const isDisabled = false
    expect(
      cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')
    ).toBe('btn btn-active')
  })
})

describe('formatDate', () => {
  it('formats a Date instance as "Month D, YYYY"', () => {
    // Construct with explicit UTC to avoid timezone flakiness on the date part.
    const date = new Date('2026-07-23T12:00:00Z')
    expect(formatDate(date)).toBe('July 23, 2026')
  })

  it('accepts an ISO string and produces the same output as the Date', () => {
    const iso = '2026-07-23T12:00:00Z'
    expect(formatDate(iso)).toBe(formatDate(new Date(iso)))
  })

  it('formats single-digit days without zero-padding', () => {
    expect(formatDate('2026-01-05T12:00:00Z')).toBe('January 5, 2026')
  })

  it('spells out the full month name', () => {
    expect(formatDate('2026-12-31T12:00:00Z')).toBe('December 31, 2026')
  })

  it('returns "Invalid Date" for an unparseable string rather than throwing', () => {
    // Documents current behavior: formatDate does no validation, so a bad
    // string yields toLocaleDateString's "Invalid Date" sentinel.
    expect(() => formatDate('not-a-date')).not.toThrow()
    expect(formatDate('not-a-date')).toBe('Invalid Date')
  })
})
