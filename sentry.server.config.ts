import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Use beforeSend to scrub PII and sensitive data
  beforeSend(event, hint) {
    // Scrub sensitive data from URLs
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /([?&](token|key|password|secret)=)[^&]*/gi,
        '$1[REDACTED]'
      )
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']
      sensitiveHeaders.forEach((header) => {
        if (event.request?.headers?.[header]) {
          event.request.headers[header] = '[REDACTED]'
        }
      })
    }

    return event
  },
})
