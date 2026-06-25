/**
 * Plausible Analytics integration
 * https://plausible.io/docs/custom-event-goals
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void
  }
}

/**
 * Track a custom event in Plausible Analytics
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props })
  }
}

/**
 * Track module completion
 */
export function trackModuleCompletion(moduleName: string, timeSpent?: number) {
  trackEvent('Module Completed', {
    module: moduleName,
    ...(timeSpent && { timeSpent }),
  })
}

/**
 * Track session milestone
 */
export function trackSessionMilestone(milestone: string, value?: number) {
  trackEvent('Session Milestone', {
    milestone,
    ...(value && { value }),
  })
}

/**
 * Track user signup
 */
export function trackSignup(method?: string) {
  trackEvent('Signup', {
    ...(method && { method }),
  })
}

/**
 * Track user login
 */
export function trackLogin(method?: string) {
  trackEvent('Login', {
    ...(method && { method }),
  })
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, success: boolean) {
  trackEvent('Form Submission', {
    form: formName,
    success,
  })
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, context?: string) {
  trackEvent('Button Click', {
    button: buttonName,
    ...(context && { context }),
  })
}

/**
 * Track page view (usually handled automatically by Plausible)
 * Use this for single-page application route changes
 */
export function trackPageView(url?: string) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', {
      props: url ? { url } : undefined,
    })
  }
}
