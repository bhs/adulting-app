'use client';

/**
 * Client-side layout wrapper that initializes telemetry and session tracking
 */

import { useEffect, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { initializeTelemetry } from '@/lib/telemetry';
import { SessionManager } from '@/lib/analytics';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Initialize OpenTelemetry on client mount
    initializeTelemetry();

    // Start session tracking
    SessionManager.startSession();

    // Track session end on page unload
    const handleUnload = () => {
      SessionManager.endSession();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      SessionManager.endSession();
    };
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
