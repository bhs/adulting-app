/**
 * OpenTelemetry Instrumentation for Next.js
 *
 * This file is automatically loaded by Next.js when the server starts.
 * It initializes the OpenTelemetry SDK with auto-instrumentation for Node.js,
 * capturing HTTP spans, errors, and database queries.
 */

export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
    const { OTLPLogExporter } = await import('@opentelemetry/exporter-logs-otlp-http');
    const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
    const { BatchLogRecordProcessor } = await import('@opentelemetry/sdk-logs');
    const { Resource } = await import('@opentelemetry/resources');
    const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } = await import('@opentelemetry/semantic-conventions');

    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

    // Create resource with service metadata
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'adulting-app',
      [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
      'deployment.environment': process.env.NODE_ENV || 'development',
    });

    // Initialize the OpenTelemetry SDK
    const sdk = new NodeSDK({
      resource,
      traceExporter: new OTLPTraceExporter({
        url: `${otlpEndpoint}/v1/traces`,
      }),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${otlpEndpoint}/v1/metrics`,
        }),
        exportIntervalMillis: 10000, // Export metrics every 10 seconds
      }),
      logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${otlpEndpoint}/v1/logs`,
        })
      ),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Automatic instrumentation for:
          // - HTTP/HTTPS
          // - Express (if used)
          // - DNS
          // - Net
          // - and more...
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable FS instrumentation to reduce noise
          },
        }),
      ],
    });

    // Start the SDK
    sdk.start();
    console.log('OpenTelemetry SDK initialized and started');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK shut down successfully'))
        .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });
  }
}
