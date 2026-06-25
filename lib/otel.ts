/**
 * OpenTelemetry Utilities
 *
 * Provides helper functions for manual instrumentation, custom spans,
 * and error tracking throughout the application.
 */

import { trace, SpanStatusCode, context } from '@opentelemetry/api'

const tracer = trace.getTracer('adulting-app', '1.0.0')

/**
 * Creates a new span for manual instrumentation
 *
 * @example
 * const result = await withSpan('processPayment', async (span) => {
 *   span.setAttribute('payment.amount', amount)
 *   return await processPayment()
 * })
 */
export async function withSpan<T>(
  name: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Records an error to the current active span
 */
export function recordError(error: Error | unknown, attributes?: Record<string, string | number | boolean>) {
  const span = trace.getActiveSpan()
  if (span) {
    span.recordException(error instanceof Error ? error : new Error(String(error)))
    span.setStatus({ code: SpanStatusCode.ERROR })

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value)
      })
    }
  }
}

/**
 * Adds custom attributes to the current active span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>) {
  const span = trace.getActiveSpan()
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value)
    })
  }
}

/**
 * Gets the current trace ID (useful for logging correlation)
 */
export function getTraceId(): string | undefined {
  const span = trace.getActiveSpan()
  if (span) {
    return span.spanContext().traceId
  }
  return undefined
}

/**
 * Creates a context with custom attributes
 */
export function withContext<T>(
  attributes: Record<string, string | number | boolean>,
  fn: () => T
): T {
  const span = trace.getActiveSpan()
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value)
    })
  }
  return fn()
}
