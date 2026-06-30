/**
 * OpenTelemetry initialization for browser-side instrumentation
 * Uses Honeycomb as the OTLP/HTTP backend
 */

import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';

let sdk: HoneycombWebSDK | null = null;

/**
 * Initialize OpenTelemetry SDK with Honeycomb configuration
 * This should be called once at app startup on the client side
 */
export function initializeTelemetry() {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Prevent double initialization
  if (sdk) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY;
  const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME || 'adulting-app';
  const environment = process.env.NODE_ENV || 'development';

  // Skip initialization if API key is not configured
  if (!apiKey) {
    console.warn(
      'NEXT_PUBLIC_HONEYCOMB_API_KEY not set - telemetry will not be sent'
    );
    return;
  }

  try {
    sdk = new HoneycombWebSDK({
      apiKey,
      serviceName,
      // Honeycomb's OTLP/HTTP endpoint
      endpoint: 'https://api.honeycomb.io/v1/traces',
      // Add resource attributes for filtering
      resourceAttributes: {
        'service.name': serviceName,
        'deployment.environment': environment,
      },
    });

    sdk.start();
    console.log('OpenTelemetry initialized with Honeycomb');
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry:', error);
  }
}

/**
 * Shutdown the telemetry SDK
 * Call this during app cleanup if needed
 */
export async function shutdownTelemetry() {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}
