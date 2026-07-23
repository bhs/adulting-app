/**
 * Small, framework-agnostic motion primitives shared by the delight-focused UI
 * (animated counters, progress transitions).
 *
 * These are deliberately pure so the animation math can be unit-tested without a
 * DOM or a running render loop; the React components that use them
 * (see {@link file://../../components/AnimatedNumber.tsx}) stay thin wrappers.
 */

/**
 * Minimum comfortable touch target, in CSS pixels. Matches the WCAG 2.5.5
 * "Target Size" guidance (and the 48dp Material / iOS thumb-friendly minimum)
 * so interactive controls stay easy to tap on a phone.
 */
export const MIN_TAP_TARGET_PX = 48

/** Clamp `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Cubic ease-out easing. Maps progress `t` in [0, 1] to an eased [0, 1] value
 * that starts fast and settles gently — the curve that makes count-ups feel
 * lively rather than mechanical. Inputs outside [0, 1] are clamped.
 */
export function easeOutCubic(t: number): number {
  const c = clamp(t, 0, 1)
  return 1 - Math.pow(1 - c, 3)
}

/**
 * Linear interpolation from `from` to `to` at progress `t`. `t` is clamped to
 * [0, 1], so `t <= 0` returns `from` and `t >= 1` returns `to`.
 */
export function interpolate(from: number, to: number, t: number): number {
  return from + (to - from) * clamp(t, 0, 1)
}

/**
 * The eased value of a count-up animation from `from` to `to` at a given point
 * in time. Returns `from` before the animation starts and snaps to exactly `to`
 * once `elapsed` reaches `duration` (or when `duration` is non-positive), so the
 * displayed number always lands on the real value.
 *
 * @param from     Starting value.
 * @param to       Target value.
 * @param elapsed  Milliseconds elapsed since the animation began.
 * @param duration Total animation duration in milliseconds.
 */
export function countUpValue(
  from: number,
  to: number,
  elapsed: number,
  duration: number
): number {
  if (duration <= 0 || elapsed >= duration) return to
  if (elapsed <= 0) return from
  return interpolate(from, to, easeOutCubic(elapsed / duration))
}

/**
 * Whether the current environment has requested reduced motion. SSR-safe: when
 * there is no `window`/`matchMedia` (server render, older jsdom) it reports
 * `false` so the default is a normally-animated experience.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
