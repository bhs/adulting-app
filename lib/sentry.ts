import * as Sentry from '@sentry/nextjs'

/**
 * Captures an exception and sends it to Sentry
 */
export function captureException(error: Error | unknown, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context)
  }
  Sentry.captureException(error)
}

/**
 * Captures a message and sends it to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * Sets user context for error tracking
 */
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  Sentry.setUser(user)
}

/**
 * Adds breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string
  category?: string
  level?: Sentry.SeverityLevel
  data?: Record<string, any>
}) {
  Sentry.addBreadcrumb(breadcrumb)
}

/**
 * Wraps an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      Sentry.captureException(error, {
        contexts: {
          operation: {
            name: context || fn.name,
            args: args,
          },
        },
      })
      throw error
    }
  }) as T
}
