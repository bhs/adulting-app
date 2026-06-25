'use client'

/**
 * Browser-side OpenTelemetry Instrumentation
 *
 * Provides client-side tracing for React components, user interactions,
 * and frontend performance monitoring.
 */

import { useEffect } from 'react'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { registerInstrumentations } from '@opentelemetry/instrumentation'

let isInitialized = false

/**
 * Initializes browser-side OpenTelemetry
 */
function initBrowserTelemetry() {
  if (isInitialized || typeof window === 'undefined') {
    return
  }

  try {
    // Get configuration from environment variables (injected at build time)
    const otlpEndpoint =
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT
    const serviceName =
      process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'adulting-app-browser'

    // Skip initialization if no endpoint configured
    if (!otlpEndpoint) {
      console.log('[OpenTelemetry Browser] No OTLP endpoint configured, skipping initialization')
      return
    }

    // Create resource with service information
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      'browser.user_agent': navigator.userAgent,
      'browser.language': navigator.language,
    })

    // Create provider
    const provider = new WebTracerProvider({
      resource,
    })

    // Configure OTLP HTTP exporter for traces
    const exporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: {},
    })

    // Add batch span processor
    provider.addSpanProcessor(new BatchSpanProcessor(exporter))

    // Register the provider
    provider.register()

    // Register auto-instrumentations for browser
    registerInstrumentations({
      instrumentations: [
        // Add browser-specific instrumentations here
        // e.g., DocumentLoadInstrumentation, UserInteractionInstrumentation
      ],
    })

    isInitialized = true
    console.log('[OpenTelemetry Browser] Initialized successfully')
  } catch (error) {
    console.error('[OpenTelemetry Browser] Failed to initialize:', error)
  }
}

/**
 * Provider component for browser-side telemetry
 */
export function BrowserTelemetryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initBrowserTelemetry()
  }, [])

  return <>{children}</>
}

/**
 * Hook to track component lifecycle and performance
 */
export function useComponentTracing(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      // Record component lifecycle metrics
      if (duration > 100) {
        // Only log slow components
        console.log(
          `[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`
        )
      }
    }
  }, [componentName])
}
