/**
 * Integration test for the budget wizard user flow.
 *
 * Unlike calculations.test.ts and reducer.test.ts (which exercise single
 * functions in isolation), this test drives the reducer through the exact
 * sequence of actions the BudgetCalculator component dispatches as a user
 * walks the three-stage wizard, then feeds the resulting state into
 * calculateBudgetSummary. It is the closest thing to an end-to-end check of
 * the "onboarding -> results" flow that we can write without a DOM renderer.
 *
 * The helpers below mirror the handlers in
 * components/BudgetCalculator/BudgetCalculator.tsx so the flow stays faithful
 * to production even though the React layer isn't mounted.
 */
import { describe, it, expect } from '@jest/globals'
import { budgetReducer, initialBudgetState } from '../reducer'
import { calculateBudgetSummary } from '../calculations'
import { BudgetState, BudgetAction } from '../types'

/** Apply a series of actions in order, returning the final state. */
function apply(state: BudgetState, ...actions: BudgetAction[]): BudgetState {
  return actions.reduce(budgetReducer, state)
}

/** Mirrors BudgetCalculator.handleNextStage: complete current, advance to next. */
function nextStage(state: BudgetState): BudgetState {
  return apply(
    state,
    { type: 'COMPLETE_STAGE', payload: { stage: state.currentStage } },
    { type: 'SET_STAGE', payload: { stage: state.currentStage + 1 } }
  )
}

/** Mirrors BudgetCalculator.handleBackStage. */
function backStage(state: BudgetState): BudgetState {
  return budgetReducer(state, {
    type: 'SET_STAGE',
    payload: { stage: state.currentStage - 1 },
  })
}

describe('budget wizard flow', () => {
  it('walks stage 1 -> 2 -> 3 and produces a correct results summary', () => {
    let state = initialBudgetState

    // Stage 1: enter spending, then advance.
    state = apply(
      state,
      { type: 'ADD_EXPENSE', payload: { name: 'Rent', amount: 1800 } },
      { type: 'ADD_EXPENSE', payload: { name: 'Groceries', amount: 500 } },
      { type: 'ADD_EXPENSE', payload: { name: 'Utilities', amount: 200 } }
    )
    expect(state.currentStage).toBe(1)
    state = nextStage(state)

    // Stage 2: enter income, then advance.
    expect(state.currentStage).toBe(2)
    expect(state.completedStages.has(1)).toBe(true)
    state = apply(
      state,
      { type: 'ADD_INCOME', payload: { name: 'Salary', amount: 4000 } },
      { type: 'ADD_INCOME', payload: { name: 'Side gig', amount: 800 } }
    )
    state = nextStage(state)

    // Stage 3: results.
    expect(state.currentStage).toBe(3)
    expect(state.completedStages.has(2)).toBe(true)

    const summary = calculateBudgetSummary(state)
    expect(summary.totalExpenses).toBe(2500)
    expect(summary.totalIncome).toBe(4800)
    expect(summary.surplus).toBe(2300)
    expect(summary.savingsRate).toBeCloseTo(47.92, 1)
    expect(summary.points).toBe(230) // floor(2300 * 0.1)
  })

  it('reflects edits made after navigating back to an earlier stage', () => {
    let state = initialBudgetState

    // Add an expense, advance to stage 2.
    state = budgetReducer(state, {
      type: 'ADD_EXPENSE',
      payload: { name: 'Rent', amount: 1800 },
    })
    state = nextStage(state)
    expect(state.currentStage).toBe(2)

    // Go back to stage 1 and correct the rent figure.
    state = backStage(state)
    expect(state.currentStage).toBe(1)
    const rentId = state.expenses[0].id
    state = budgetReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: { id: rentId, name: 'Rent', amount: 2000 },
    })

    // Completed-stages set from the first pass is preserved across back-nav.
    expect(state.completedStages.has(1)).toBe(true)
    expect(calculateBudgetSummary(state).totalExpenses).toBe(2000)
  })

  it('surfaces a deficit (zero points) when expenses exceed income', () => {
    let state = initialBudgetState
    state = apply(
      state,
      { type: 'ADD_EXPENSE', payload: { name: 'Rent', amount: 3000 } },
      { type: 'ADD_INCOME', payload: { name: 'Salary', amount: 2500 } }
    )

    const summary = calculateBudgetSummary(state)
    expect(summary.surplus).toBe(-500)
    expect(summary.savingsRate).toBeCloseTo(-20, 1)
    expect(summary.points).toBe(0)
  })

  it('clears all wizard state when the user resets', () => {
    let state = initialBudgetState
    state = apply(
      state,
      { type: 'ADD_EXPENSE', payload: { name: 'Rent', amount: 1800 } },
      { type: 'ADD_INCOME', payload: { name: 'Salary', amount: 4000 } }
    )
    state = nextStage(nextStage(state))
    expect(state.currentStage).toBe(3)

    state = budgetReducer(state, { type: 'RESET' })
    expect(state).toEqual(initialBudgetState)

    // A fresh calculation on the reset state is the empty summary.
    const summary = calculateBudgetSummary(state)
    expect(summary).toEqual({
      totalExpenses: 0,
      totalIncome: 0,
      surplus: 0,
      savingsRate: 0,
      points: 0,
    })
  })
})
