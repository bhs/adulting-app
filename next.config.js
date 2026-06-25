const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Enable source maps for better error tracking
  productionBrowserSourceMaps: true,
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps to Sentry
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Additional config options for the Sentry webpack plugin
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
}

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
