'use client'

import { useEffect, useRef, useState } from 'react'
import { countUpValue, prefersReducedMotion } from '@/lib/ui/motion'

interface AnimatedNumberProps {
  /** The target value to display. Changes animate a smooth count-up/down. */
  value: number
  /** Formats the (possibly fractional) in-flight value for display. */
  format?: (value: number) => string
  /** Animation duration in milliseconds. */
  durationMs?: number
  className?: string
}

/**
 * A number that smoothly counts to its new value whenever `value` changes,
 * turning an otherwise abrupt jump (e.g. a running budget total) into a small
 * moment of delight. Honors `prefers-reduced-motion` by snapping instantly, and
 * always lands on the exact target value so the displayed figure is never
 * approximate at rest.
 */
export function AnimatedNumber({
  value,
  format = (v) => String(Math.round(v)),
  durationMs = 500,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  // Track the currently-rendered value so an animation interrupted by a new
  // target starts from where the eye currently is, not from the old target.
  const displayRef = useRef(value)

  useEffect(() => {
    const from = displayRef.current

    if (from === value || durationMs <= 0 || prefersReducedMotion()) {
      displayRef.current = value
      setDisplay(value)
      return
    }

    let raf = 0
    let start: number | null = null

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const current = countUpValue(from, value, elapsed, durationMs)
      displayRef.current = current
      setDisplay(current)
      if (elapsed < durationMs) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])

  return <span className={className}>{format(display)}</span>
}
