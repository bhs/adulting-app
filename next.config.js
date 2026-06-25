/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Enable instrumentation hook for OpenTelemetry
    instrumentationHook: true,
  },
}

module.exports = nextConfig
