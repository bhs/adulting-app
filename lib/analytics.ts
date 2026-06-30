import Plausible from 'plausible-tracker'

// Initialize Plausible tracker
const plausible = Plausible({
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
  apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
  trackLocalhost: process.env.NODE_ENV === 'development',
})

// Enable automatic pageview tracking
export const { enableAutoPageviews, trackPageview, trackEvent } = plausible

// Custom event types for type safety
export type CustomEvent =
  | { name: 'budget_created'; props: { amount?: number; category?: string } }
  | { name: 'session_active'; props: { duration?: number } }
  | { name: 'api_call'; props: { endpoint: string; status: number } }
  | { name: 'user_action'; props: { action: string; component?: string } }

// Type-safe event tracking function
export const trackCustomEvent = (event: CustomEvent) => {
  trackEvent(event.name, { props: event.props })
}

// Session tracking
let sessionStartTime: number | null = null
let sessionTimer: NodeJS.Timeout | null = null

export const startSessionTracking = () => {
  if (typeof window === 'undefined') return

  sessionStartTime = Date.now()

  // Track session active every 5 minutes
  sessionTimer = setInterval(() => {
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000)
      trackCustomEvent({
        name: 'session_active',
        props: { duration },
      })
    }
  }, 5 * 60 * 1000) // 5 minutes
}

export const stopSessionTracking = () => {
  if (sessionTimer) {
    clearInterval(sessionTimer)
    sessionTimer = null
  }

  if (sessionStartTime) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000)
    trackCustomEvent({
      name: 'session_active',
      props: { duration },
    })
    sessionStartTime = null
  }
}
