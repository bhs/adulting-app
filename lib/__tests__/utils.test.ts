import { describe, it, expect } from '@jest/globals'
import { cn, formatDate } from '../utils'

describe('cn', () => {
  it('joins truthy class names with a space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b')
  })

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('supports conditional class expressions', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active'
    )
  })
})

describe('formatDate', () => {
  it('formats a Date object as a long US date', () => {
    // Construct with explicit parts to avoid timezone drift on the date value.
    const date = new Date(2024, 0, 15) // Jan 15, 2024 (local time)
    expect(formatDate(date)).toBe('January 15, 2024')
  })

  it('accepts an ISO date string', () => {
    // Midday UTC keeps the calendar day stable across common timezones.
    expect(formatDate('2024-12-25T12:00:00Z')).toBe('December 25, 2024')
  })
})
