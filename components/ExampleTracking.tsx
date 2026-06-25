'use client'

import { useState } from 'react'
import { captureException, addBreadcrumb } from '@/lib/sentry'
import { trackButtonClick, trackEvent } from '@/lib/analytics'

/**
 * Example component demonstrating Sentry and Plausible integration
 * This is a reference implementation - feel free to adapt to your needs
 */
export function ExampleTracking() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    // Track button click in analytics
    trackButtonClick('increment-counter', 'example-component')

    // Add breadcrumb for debugging
    addBreadcrumb({
      message: 'User incremented counter',
      category: 'user-action',
      data: { previousCount: count },
    })

    setCount(count + 1)

    // Track milestone when reaching 10
    if (count + 1 === 10) {
      trackEvent('milestone-reached', {
        milestone: 'counter-10',
        value: 10,
      })
    }
  }

  const handleError = async () => {
    try {
      addBreadcrumb({
        message: 'User triggered test error',
        category: 'test',
      })

      // Simulate an API error
      throw new Error('This is a test error for Sentry')
    } catch (err) {
      // Capture the error with context
      captureException(err, {
        component: 'ExampleTracking',
        action: 'handleError',
        count: count,
      })

      setError('Error captured! Check your Sentry dashboard.')
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold">Tracking Example</h3>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Counter: <span className="font-bold">{count}</span>
        </p>

        <div className="space-x-2">
          <button
            onClick={handleClick}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Increment (Tracked)
          </button>

          <button
            onClick={handleError}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Test Error Tracking
          </button>
        </div>

        {error && (
          <div className="rounded bg-green-100 p-3 text-sm text-green-800">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <p>• Button clicks are tracked in Plausible</p>
        <p>• Counter increments add Sentry breadcrumbs</p>
        <p>• Reaching 10 triggers a custom analytics event</p>
        <p>• Test button sends an error to Sentry with context</p>
      </div>
    </div>
  )
}
