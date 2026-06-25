/**
 * OpenTelemetry Instrumentation for Next.js
 *
 * This file is automatically loaded by Next.js when the application starts.
 * It initializes the OpenTelemetry SDK with auto-instrumentation for Node.js
 * and configures OTLP HTTP exporters for traces and metrics.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node')
    const { getNodeAutoInstrumentations } = await import(
      '@opentelemetry/auto-instrumentations-node'
    )
    const { OTLPTraceExporter } = await import(
      '@opentelemetry/exporter-trace-otlp-http'
    )
    const { OTLPMetricExporter } = await import(
      '@opentelemetry/exporter-metrics-otlp-http'
    )
    const { PeriodicExportingMetricReader } = await import(
      '@opentelemetry/sdk-metrics'
    )
    const { Resource } = await import('@opentelemetry/resources')
    const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } =
      await import('@opentelemetry/semantic-conventions')

    // Determine service name and version
    const serviceName =
      process.env.OTEL_SERVICE_NAME || 'adulting-app'
    const serviceVersion = process.env.OTEL_SERVICE_VERSION || '1.0.0'
    const environment = process.env.NODE_ENV || 'development'

    // Get OTLP endpoint and headers from environment variables
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    const otlpHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS

    // Parse headers if provided (format: "key1=value1,key2=value2")
    const headers: Record<string, string> = {}
    if (otlpHeaders) {
      otlpHeaders.split(',').forEach((header) => {
        const [key, value] = header.split('=')
        if (key && value) {
          headers[key.trim()] = value.trim()
        }
      })
    }

    // Create resource with service information
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
      environment,
    })

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: otlpEndpoint
        ? `${otlpEndpoint}/v1/traces`
        : 'http://localhost:4318/v1/traces',
      headers,
    })

    // Configure metric exporter
    const metricExporter = new OTLPMetricExporter({
      url: otlpEndpoint
        ? `${otlpEndpoint}/v1/metrics`
        : 'http://localhost:4318/v1/metrics',
      headers,
    })

    // Create metric reader with 60-second interval
    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // 60 seconds
    })

    // Initialize the SDK
    const sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Automatically instrument HTTP, Express, and other Node.js modules
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable file system instrumentation to reduce noise
          },
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-express': {
            enabled: true,
          },
        }),
      ],
    })

    // Start the SDK
    sdk.start()

    // Log initialization status
    console.log('[OpenTelemetry] SDK initialized successfully')
    console.log(`[OpenTelemetry] Service: ${serviceName}`)
    console.log(`[OpenTelemetry] Environment: ${environment}`)
    console.log(
      `[OpenTelemetry] Exporting to: ${otlpEndpoint || 'http://localhost:4318'}`
    )

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => {
          console.log('[OpenTelemetry] SDK shut down successfully')
        })
        .catch((error) => {
          console.error('[OpenTelemetry] Error shutting down SDK:', error)
        })
        .finally(() => process.exit(0))
    })
  }
}
