import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environment-aware configuration
  environment: process.env.NODE_ENV || 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Capture unhandled promise rejections
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.extraErrorDataIntegration({ depth: 10 }),
  ],

  beforeSend(event, hint) {
    // Add additional context for server-side errors
    if (event.exception) {
      const error = hint.originalException

      // Add database error context
      if (error instanceof Error && error.message.includes('Prisma')) {
        event.tags = {
          ...event.tags,
          error_type: 'database',
        }
      }
    }

    return event
  },
})
