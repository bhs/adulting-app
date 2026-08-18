/**
 * SSO auth telemetry.
 *
 * Login outcomes are recorded as OpenTelemetry span events so they land in
 * Honeycomb alongside the rest of the app's traces (see lib/analytics.ts for
 * the session/budget equivalents). Each helper opens a short-lived span,
 * attaches the named event with its attributes, sets the span status, and ends
 * it — mirroring the vendor-portable, standard-semantic-conventions style used
 * across the codebase.
 */
import { trace, SpanStatusCode, type Attributes } from '@opentelemetry/api'

const tracer = trace.getTracer('auth')

/** Emitted when a school SSO login completes successfully. */
export function trackSsoLoginSuccess(attributes?: {
  userId?: string
  email?: string
  provider?: string
}) {
  const eventAttributes: Attributes = { 'event.name': 'sso_login_success' }
  if (attributes?.provider)
    eventAttributes['auth.provider'] = attributes.provider
  if (attributes?.userId) eventAttributes['user.id'] = attributes.userId
  if (attributes?.email) eventAttributes['user.email'] = attributes.email

  const span = tracer.startSpan('sso.login')
  span.addEvent('sso_login_success', eventAttributes)
  span.setStatus({ code: SpanStatusCode.OK })
  span.end()
}

/** Emitted when a school SSO login fails or is aborted. */
export function trackSsoLoginFailure(attributes?: {
  provider?: string
  error?: string
}) {
  const eventAttributes: Attributes = { 'event.name': 'sso_login_failure' }
  if (attributes?.provider)
    eventAttributes['auth.provider'] = attributes.provider
  if (attributes?.error) eventAttributes['auth.error'] = attributes.error

  const span = tracer.startSpan('sso.login')
  span.addEvent('sso_login_failure', eventAttributes)
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: attributes?.error,
  })
  span.end()
}
