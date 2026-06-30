'use client'

import { useEffect } from 'react'
import { enableAutoPageviews, startSessionTracking, stopSessionTracking } from '@/lib/analytics'

// Import test utilities in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/analytics-test')
}

export default function PlausibleScript() {
  useEffect(() => {
    // Enable automatic pageview tracking
    const cleanup = enableAutoPageviews()

    // Start session tracking
    startSessionTracking()

    // Cleanup on unmount
    return () => {
      cleanup()
      stopSessionTracking()
    }
  }, [])

  return null
}
