'use client'

import { useState } from 'react'
import { trackCustomEvent } from '@/lib/analytics'
import * as Sentry from '@sentry/nextjs'

export default function BudgetDemo() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('groceries')

  const handleCreateBudget = () => {
    try {
      // Track the budget creation event
      trackCustomEvent({
        name: 'budget_created',
        props: {
          amount: parseFloat(amount) || 0,
          category,
        },
      })

      // Add a breadcrumb to Sentry for debugging context
      Sentry.addBreadcrumb({
        category: 'budget',
        message: `Budget created: ${category} - $${amount}`,
        level: 'info',
      })

      alert(`Budget created: ${category} - $${amount}`)
      setAmount('')
    } catch (error) {
      // Capture error in Sentry
      Sentry.captureException(error)
      console.error('Error creating budget:', error)
    }
  }

  const handleTestError = () => {
    // This will trigger the error boundary and send to Sentry
    throw new Error('Test error for Sentry integration')
  }

  return (
    <div className="mt-8 p-6 border border-gray-300 rounded-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Budget Demo</h3>
      <p className="text-sm text-gray-600 mb-4">
        This demonstrates Plausible Analytics event tracking and Sentry error monitoring.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="groceries">Groceries</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="transportation">Transportation</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={handleCreateBudget}
          disabled={!amount}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Budget
        </button>

        <button
          onClick={handleTestError}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          Test Error Boundary
        </button>
      </div>
    </div>
  )
}
