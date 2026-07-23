// Extends Jest's `expect` with DOM matchers such as `toBeInTheDocument`.
import '@testing-library/jest-dom'

// framer-motion drives real animations and requestAnimationFrame timing that
// add noise and act() warnings under jsdom. For unit/integration tests we only
// care about the rendered DOM, so replace motion components with plain
// elements and make AnimatePresence a passthrough.
jest.mock('framer-motion', () => {
  const React = require('react')

  // Strip animation-only props so they don't leak onto real DOM nodes and
  // trigger React "unknown prop" warnings.
  const ANIMATION_PROPS = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileInView',
    'layout',
    'layoutId',
  ])

  const createMotionComponent = (element: string) =>
    React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
      const domProps: Record<string, unknown> = {}
      for (const key of Object.keys(props)) {
        if (!ANIMATION_PROPS.has(key)) {
          domProps[key] = props[key]
        }
      }
      return React.createElement(element, { ...domProps, ref })
    })

  // Cache one component per tag. Returning a stable reference is essential:
  // if `motion.div` yielded a fresh component every access, React would treat
  // each render as a new component type and remount the subtree, wiping input
  // state between keystrokes.
  const cache: Record<string, unknown> = {}
  const motion = new Proxy(
    {},
    {
      get: (_target, element: string) => {
        if (!cache[element]) {
          cache[element] = createMotionComponent(element)
        }
        return cache[element]
      },
    }
  )

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})
