/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable experimental instrumentation for OpenTelemetry
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig
