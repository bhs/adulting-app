/**
 * Unit tests for the pure motion primitives in lib/ui/motion.ts.
 *
 * The count-up animation used across the wizard's totals and summary is driven
 * entirely by these functions, so their edge behavior (clamping, snapping to the
 * target, honoring reduced-motion) is what keeps displayed numbers correct.
 */
import { describe, it, expect, afterEach } from '@jest/globals'
import {
  MIN_TAP_TARGET_PX,
  clamp,
  easeOutCubic,
  interpolate,
  countUpValue,
  prefersReducedMotion,
} from '../motion'

describe('MIN_TAP_TARGET_PX', () => {
  it('meets the 48px thumb-friendly minimum', () => {
    expect(MIN_TAP_TARGET_PX).toBeGreaterThanOrEqual(48)
  })
})

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
    [0, 0, 10, 0],
    [10, 0, 10, 10],
  ])('clamp(%p, %p, %p) === %p', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected)
  })
})

describe('easeOutCubic', () => {
  it('pins the endpoints at 0 and 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it('is decelerating: past the halfway output by the halfway input', () => {
    // An ease-out curve is above the y=x diagonal, so at t=0.5 output > 0.5.
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('is monotonically increasing across the range', () => {
    let prev = -Infinity
    for (let t = 0; t <= 1.0001; t += 0.1) {
      const v = easeOutCubic(t)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })

  it('clamps inputs outside [0, 1]', () => {
    expect(easeOutCubic(-2)).toBe(0)
    expect(easeOutCubic(5)).toBe(1)
  })
})

describe('interpolate', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(interpolate(100, 200, 0)).toBe(100)
    expect(interpolate(100, 200, 1)).toBe(200)
  })

  it('returns the midpoint at t=0.5', () => {
    expect(interpolate(0, 100, 0.5)).toBe(50)
  })

  it('clamps t so it never overshoots the target range', () => {
    expect(interpolate(0, 100, -1)).toBe(0)
    expect(interpolate(0, 100, 2)).toBe(100)
  })

  it('handles a decreasing range', () => {
    expect(interpolate(200, 100, 0.5)).toBe(150)
  })
})

describe('countUpValue', () => {
  it('returns the start value before the animation begins', () => {
    expect(countUpValue(0, 1000, 0, 500)).toBe(0)
    expect(countUpValue(0, 1000, -10, 500)).toBe(0)
  })

  it('snaps exactly to the target once the duration is reached', () => {
    expect(countUpValue(0, 1000, 500, 500)).toBe(1000)
    expect(countUpValue(0, 1000, 600, 500)).toBe(1000)
  })

  it('returns the target immediately for a non-positive duration', () => {
    expect(countUpValue(0, 1000, 0, 0)).toBe(1000)
    expect(countUpValue(0, 1000, 0, -100)).toBe(1000)
  })

  it('stays strictly between start and target mid-animation', () => {
    const mid = countUpValue(0, 1000, 250, 500)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1000)
  })

  it('counts down when the target is below the start', () => {
    const mid = countUpValue(1000, 0, 250, 500)
    expect(mid).toBeLessThan(1000)
    expect(mid).toBeGreaterThan(0)
    expect(countUpValue(1000, 0, 500, 500)).toBe(0)
  })
})

describe('prefersReducedMotion', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    // Restore whatever jsdom provided so tests stay independent.
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia
    } else {
      // @ts-expect-error jsdom may not define matchMedia by default.
      delete window.matchMedia
    }
  })

  it('reports true when the user requests reduced motion', () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    expect(prefersReducedMotion()).toBe(true)
  })

  it('reports false when reduced motion is not requested', () => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    expect(prefersReducedMotion()).toBe(false)
  })

  it('falls back to false when matchMedia is unavailable', () => {
    // @ts-expect-error simulate an environment without matchMedia (SSR-like).
    delete window.matchMedia
    expect(prefersReducedMotion()).toBe(false)
  })
})
