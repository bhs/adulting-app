/**
 * Analytics Integration Test Utilities
 *
 * This file contains utilities for testing the Sentry and Plausible integrations.
 * Use these functions to verify that events are being tracked correctly.
 */

import * as Sentry from '@sentry/nextjs'
import { trackCustomEvent } from './analytics'

/**
 * Test Sentry error capture
 * This will send a test error to Sentry to verify the integration is working
 */
export const testSentryErrorCapture = () => {
  try {
    // Simulate an error
    throw new Error('Test error for Sentry integration verification')
  } catch (error) {
    Sentry.captureException(error)
    console.log('✓ Test error sent to Sentry')
  }
}

/**
 * Test Sentry message capture
 */
export const testSentryMessage = () => {
  Sentry.captureMessage('Test message from analytics integration', 'info')
  console.log('✓ Test message sent to Sentry')
}

/**
 * Test Sentry breadcrumbs
 */
export const testSentryBreadcrumbs = () => {
  Sentry.addBreadcrumb({
    category: 'test',
    message: 'Test breadcrumb for Sentry integration',
    level: 'info',
    data: {
      testKey: 'testValue',
      timestamp: new Date().toISOString(),
    },
  })
  console.log('✓ Test breadcrumb added to Sentry')
}

/**
 * Test Plausible custom event tracking
 */
export const testPlausibleEvents = () => {
  // Test budget creation event
  trackCustomEvent({
    name: 'budget_created',
    props: {
      amount: 100,
      category: 'test',
    },
  })
  console.log('✓ Test budget_created event sent to Plausible')

  // Test user action event
  trackCustomEvent({
    name: 'user_action',
    props: {
      action: 'test_action',
      component: 'test_component',
    },
  })
  console.log('✓ Test user_action event sent to Plausible')
}

/**
 * Test session tracking
 */
export const testSessionTracking = () => {
  trackCustomEvent({
    name: 'session_active',
    props: {
      duration: 60, // 1 minute test
    },
  })
  console.log('✓ Test session_active event sent to Plausible')
}

/**
 * Run all integration tests
 * Call this function from the browser console to verify all integrations
 */
export const runAllAnalyticsTests = () => {
  console.log('🧪 Running analytics integration tests...\n')

  // Test Sentry
  console.log('Testing Sentry integration:')
  testSentryMessage()
  testSentryBreadcrumbs()
  testSentryErrorCapture()

  console.log('\nTesting Plausible integration:')
  testPlausibleEvents()
  testSessionTracking()

  console.log('\n✅ All tests completed. Check your dashboards:')
  console.log('- Sentry: https://sentry.io/organizations/[org]/issues/')
  console.log('- Plausible: https://plausible.io/[domain]')
}

/**
 * Verify environment configuration
 */
export const verifyAnalyticsConfig = () => {
  const config = {
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? '✓ Configured' : '✗ Missing',
      org: process.env.SENTRY_ORG ? '✓ Configured' : '✗ Missing (optional)',
      project: process.env.SENTRY_PROJECT ? '✓ Configured' : '✗ Missing (optional)',
    },
    plausible: {
      domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? '✓ Configured' : '✗ Missing',
      apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'Using default',
    },
  }

  console.log('📊 Analytics Configuration Status:\n')
  console.log('Sentry:')
  console.log(`  DSN: ${config.sentry.dsn}`)
  console.log(`  Org: ${config.sentry.org}`)
  console.log(`  Project: ${config.sentry.project}`)
  console.log('\nPlausible:')
  console.log(`  Domain: ${config.plausible.domain}`)
  console.log(`  API Host: ${config.plausible.apiHost}`)

  return config
}

// Make functions available in browser console for easy testing
if (typeof window !== 'undefined') {
  ;(window as any).analyticsTest = {
    runAll: runAllAnalyticsTests,
    verify: verifyAnalyticsConfig,
    sentry: {
      error: testSentryErrorCapture,
      message: testSentryMessage,
      breadcrumb: testSentryBreadcrumbs,
    },
    plausible: {
      events: testPlausibleEvents,
      session: testSessionTracking,
    },
  }
}
