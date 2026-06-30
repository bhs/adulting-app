'use client';

/**
 * Example component demonstrating error tracking and analytics usage
 * This is a reference implementation showing how to integrate telemetry
 */

import { useState } from 'react';
import { trackBudgetCreated, trackCustomEvent } from '@/lib/analytics';

export function AnalyticsExample() {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('groceries');

  const handleCreateBudget = () => {
    if (!budgetAmount) return;

    const budgetId = `budget-${Date.now()}`;
    const amount = parseFloat(budgetAmount);

    // Track budget creation event
    trackBudgetCreated({
      budgetId,
      amount,
      currency: 'USD',
      category: budgetCategory,
    });

    // Track custom event for feature usage
    trackCustomEvent('budget_form_submitted', {
      category: budgetCategory,
      amount,
    });

    alert(`Budget created: $${amount} for ${budgetCategory}`);
    setBudgetAmount('');
  };

  const handleTestError = () => {
    // This will be caught by ErrorBoundary and sent to Honeycomb
    throw new Error('Test error from AnalyticsExample component');
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Analytics Example</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Budget Amount
          </label>
          <input
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            placeholder="100"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            value={budgetCategory}
            onChange={(e) => setBudgetCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="groceries">Groceries</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="transportation">Transportation</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateBudget}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Budget
          </button>

          <button
            onClick={handleTestError}
            className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Test Error
          </button>
        </div>
      </div>

      <div className="mt-6 rounded bg-gray-50 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium">Try it out:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>Create Budget</strong>: Sends budget_created event to
            Honeycomb
          </li>
          <li>
            <strong>Test Error</strong>: Triggers ErrorBoundary and records
            error
          </li>
          <li>Sessions are tracked automatically on page load/unload</li>
        </ul>
      </div>
    </div>
  );
}
