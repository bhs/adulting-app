'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { guidedBudgetReducer, initialGuidedState } from '@/lib/budget/guided/reducer'
import {
  CATEGORY_ORDER,
  CategoryKey,
  SUMMARY_STEP_INDEX,
} from '@/lib/budget/guided/types'
import { calculateTotals } from '@/lib/budget/guided/calculations'
import { loadState, saveState, clearState } from '@/lib/budget/guided/storage'
import { trackCustomEvent } from '@/lib/analytics'
import { ProgressIndicator } from './ProgressIndicator'
import { IncomeStep } from './steps/IncomeStep'
import { FixedExpensesStep } from './steps/FixedExpensesStep'
import { VariableExpensesStep } from './steps/VariableExpensesStep'
import { SavingsStep } from './steps/SavingsStep'
import { SummaryDashboard } from './SummaryDashboard'

/** Progress-bar labels for the four data-entry steps plus the summary. */
const STEPS = [
  { title: 'Income', shortTitle: 'Income' },
  { title: 'Fixed Expenses', shortTitle: 'Fixed' },
  { title: 'Variable Spending', shortTitle: 'Variable' },
  { title: 'Savings', shortTitle: 'Savings' },
  { title: 'Summary', shortTitle: 'Summary' },
]

export function GuidedBudgetWizard() {
  const [state, dispatch] = useReducer(guidedBudgetReducer, initialGuidedState)
  // Gate persistence until we've attempted to hydrate, so we never overwrite a
  // returning user's saved budget with the empty initial state.
  const [hydrated, setHydrated] = useState(false)
  const trackedCompletion = useRef(false)

  // Load any persisted state once, after mount (localStorage is client-only).
  useEffect(() => {
    const stored = loadState()
    if (stored) {
      dispatch({ type: 'HYDRATE', payload: stored })
    }
    setHydrated(true)
  }, [])

  // Persist on every change once hydrated.
  useEffect(() => {
    if (hydrated) {
      saveState(state)
    }
  }, [state, hydrated])

  // Fire a single analytics event the first time the user reaches the summary.
  useEffect(() => {
    if (state.stepIndex === SUMMARY_STEP_INDEX && !trackedCompletion.current) {
      trackedCompletion.current = true
      const totals = calculateTotals(state)
      trackCustomEvent('guided_budget_completed', {
        income: totals.income,
        savings_rate: Math.round(totals.savingsRate),
        quick_mode: state.quickMode,
      })
    }
  }, [state])

  const addItem = (category: CategoryKey) => (name: string, amount: number) =>
    dispatch({ type: 'ADD_ITEM', payload: { category, name, amount } })
  const updateItem = (category: CategoryKey) => (id: string, name: string, amount: number) =>
    dispatch({ type: 'UPDATE_ITEM', payload: { category, id, name, amount } })
  const removeItem = (category: CategoryKey) => (id: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { category, id } })

  const handleNext = () => dispatch({ type: 'NEXT_STEP' })
  const handleBack = () => dispatch({ type: 'PREV_STEP' })
  const handleStepClick = (stepIndex: number) =>
    dispatch({ type: 'GO_TO_STEP', payload: { stepIndex } })

  const handleReset = () => {
    clearState()
    trackedCompletion.current = false
    dispatch({ type: 'RESET' })
  }

  const toggleQuickMode = () => {
    const enabled = !state.quickMode
    dispatch({ type: 'SET_QUICK_MODE', payload: { enabled } })
    trackCustomEvent('guided_budget_quick_mode_toggled', { enabled })
  }

  const totals = calculateTotals(state)

  const renderStep = () => {
    switch (state.stepIndex) {
      case 0:
        return (
          <IncomeStep
            key="income"
            items={state.income}
            quickMode={state.quickMode}
            onAdd={addItem('income')}
            onUpdate={updateItem('income')}
            onRemove={removeItem('income')}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 1:
        return (
          <FixedExpensesStep
            key="fixed"
            items={state.fixed}
            income={totals.income}
            quickMode={state.quickMode}
            onAdd={addItem('fixed')}
            onUpdate={updateItem('fixed')}
            onRemove={removeItem('fixed')}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <VariableExpensesStep
            key="variable"
            items={state.variable}
            income={totals.income}
            quickMode={state.quickMode}
            onAdd={addItem('variable')}
            onUpdate={updateItem('variable')}
            onRemove={removeItem('variable')}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <SavingsStep
            key="savings"
            items={state.savings}
            income={totals.income}
            quickMode={state.quickMode}
            onAdd={addItem('savings')}
            onUpdate={updateItem('savings')}
            onRemove={removeItem('savings')}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      default:
        return (
          <SummaryDashboard
            key="summary"
            state={state}
            onBack={handleBack}
            onReset={handleReset}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressIndicator
        steps={STEPS}
        currentStep={Math.min(state.stepIndex, CATEGORY_ORDER.length)}
        completedSteps={state.completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Quick-mode toggle for returning users who want to skip the lessons. */}
      <div className="max-w-3xl mx-auto px-6 pt-4 flex justify-end">
        <button
          type="button"
          onClick={toggleQuickMode}
          aria-pressed={state.quickMode}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>Quick mode</span>
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              state.quickMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                state.quickMode ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            {state.quickMode ? '(lessons hidden)' : '(lessons shown)'}
          </span>
        </button>
      </div>

      <div className="pb-12">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </div>
  )
}
