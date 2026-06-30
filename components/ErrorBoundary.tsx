'use client';

/**
 * React ErrorBoundary that captures and reports errors to OpenTelemetry
 * Uses standard OTel semantic conventions for error tracking
 */

import React, { Component, ReactNode } from 'react';
import { trace, SpanStatusCode } from '@opentelemetry/api';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Record error as an OTel span with standard semantic conventions
    const tracer = trace.getTracer('error-boundary');
    const span = tracer.startSpan('error.boundary.catch', {
      attributes: {
        // Standard OTel semantic conventions for errors
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack || '',
        // React-specific context
        'error.component.stack': errorInfo.componentStack || '',
        'error.boundary': true,
      },
    });

    // Mark span as error
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });

    // Record exception event on the span
    span.recordException(error);

    // End the span
    span.end();

    // Log to console for development visibility
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-bold text-red-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-red-700">
              An error occurred while rendering this page. Please refresh to try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
