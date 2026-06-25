'use client';

/**
 * Browser-side OpenTelemetry Instrumentation
 *
 * This component initializes OpenTelemetry in the browser to capture:
 * - Frontend traces (page loads, user interactions)
 * - Session duration metrics
 * - Browser errors and exceptions
 */

import { useEffect } from 'react';

export function OpenTelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize once
    if (typeof window !== 'undefined' && !(window as any).__otelInitialized) {
      (window as any).__otelInitialized = true;

      // Dynamic import to avoid SSR issues
      import('@opentelemetry/sdk-trace-web').then(({ WebTracerProvider, BatchSpanProcessor }) => {
        Promise.all([
          import('@opentelemetry/exporter-trace-otlp-http'),
          import('@opentelemetry/resources'),
          import('@opentelemetry/semantic-conventions'),
          import('@opentelemetry/api'),
          import('@opentelemetry/sdk-metrics'),
        ]).then(([
          { OTLPTraceExporter },
          { Resource },
          { SEMRESATTRS_SERVICE_NAME },
          otelApi,
          { MeterProvider, PeriodicExportingMetricReader },
        ]) => {
          const otlpEndpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

          // Create resource
          const resource = new Resource({
            [SEMRESATTRS_SERVICE_NAME]: 'adulting-app-browser',
            'deployment.environment': process.env.NODE_ENV || 'development',
          });

          // Initialize tracer provider
          const provider = new WebTracerProvider({ resource });

          // Add batch span processor with OTLP exporter
          provider.addSpanProcessor(
            new BatchSpanProcessor(
              new OTLPTraceExporter({
                url: `${otlpEndpoint}/v1/traces`,
              })
            )
          );

          // Register the provider
          provider.register();

          // Initialize metrics provider
          const meterProvider = new MeterProvider({
            resource,
            readers: [
              new PeriodicExportingMetricReader({
                exporter: new (await import('@opentelemetry/exporter-metrics-otlp-http')).OTLPMetricExporter({
                  url: `${otlpEndpoint}/v1/metrics`,
                }),
                exportIntervalMillis: 10000,
              }),
            ],
          });

          otelApi.metrics.setGlobalMeterProvider(meterProvider);

          // Track session duration
          const meter = meterProvider.getMeter('adulting-app-browser');
          const sessionStart = Date.now();

          // Create session duration histogram
          const sessionDurationHistogram = meter.createHistogram('browser.session.duration', {
            description: 'Duration of browser sessions in milliseconds',
            unit: 'ms',
          });

          // Track page views
          const pageViewCounter = meter.createCounter('browser.page.views', {
            description: 'Number of page views',
          });

          pageViewCounter.add(1, {
            'page.path': window.location.pathname,
          });

          // Record session duration on unload
          const recordSessionDuration = () => {
            const duration = Date.now() - sessionStart;
            sessionDurationHistogram.record(duration, {
              'page.path': window.location.pathname,
            });
          };

          window.addEventListener('beforeunload', recordSessionDuration);

          // Track uncaught errors
          window.addEventListener('error', (event) => {
            const tracer = otelApi.trace.getTracer('adulting-app-browser');
            const span = tracer.startSpan('browser.error', {
              attributes: {
                'error.type': 'uncaught_exception',
                'error.message': event.message,
                'error.filename': event.filename,
                'error.lineno': event.lineno,
                'error.colno': event.colno,
              },
            });
            span.recordException(event.error);
            span.end();
          });

          // Track unhandled promise rejections
          window.addEventListener('unhandledrejection', (event) => {
            const tracer = otelApi.trace.getTracer('adulting-app-browser');
            const span = tracer.startSpan('browser.error', {
              attributes: {
                'error.type': 'unhandled_rejection',
                'error.message': event.reason?.message || String(event.reason),
              },
            });
            span.recordException(event.reason);
            span.end();
          });

          console.log('Browser OpenTelemetry initialized');
        }).catch((error) => {
          console.error('Failed to initialize browser OpenTelemetry:', error);
        });
      }).catch((error) => {
        console.error('Failed to load OpenTelemetry SDK:', error);
      });
    }
  }, []);

  return <>{children}</>;
}
