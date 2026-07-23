import { describe, it, expect, beforeEach } from '@jest/globals'
import { guidedBudgetReducer, initialGuidedState, categoryForStep } from '../reducer'
import { GuidedBudgetState, SUMMARY_STEP_INDEX } from '../types'

describe('guidedBudgetReducer', () => {
  let state: GuidedBudgetState

  beforeEach(() => {
    state = { ...initialGuidedState, completedSteps: [] }
  })

  describe('ADD_ITEM', () => {
    it('adds an item to the specified category with a generated id', () => {
      const next = guidedBudgetReducer(state, {
        type: 'ADD_ITEM',
        payload: { category: 'income', name: 'Salary', amount: 4000 },
      })

      expect(next.income).toHaveLength(1)
      expect(next.income[0].name).toBe('Salary')
      expect(next.income[0].amount).toBe(4000)
      expect(next.income[0].id).toBeDefined()
    })

    it('keeps categories independent', () => {
      let next = guidedBudgetReducer(state, {
        type: 'ADD_ITEM',
        payload: { category: 'fixed', name: 'Rent', amount: 1500 },
      })
      next = guidedBudgetReducer(next, {
        type: 'ADD_ITEM',
        payload: { category: 'variable', name: 'Groceries', amount: 400 },
      })

      expect(next.fixed).toHaveLength(1)
      expect(next.variable).toHaveLength(1)
      expect(next.income).toHaveLength(0)
      expect(next.savings).toHaveLength(0)
    })
  })

  describe('UPDATE_ITEM', () => {
    it('updates the matching item only', () => {
      let next = guidedBudgetReducer(state, {
        type: 'ADD_ITEM',
        payload: { category: 'fixed', name: 'Rent', amount: 1500 },
      })
      next = guidedBudgetReducer(next, {
        type: 'ADD_ITEM',
        payload: { category: 'fixed', name: 'Insurance', amount: 100 },
      })
      const targetId = next.fixed[0].id

      next = guidedBudgetReducer(next, {
        type: 'UPDATE_ITEM',
        payload: { category: 'fixed', id: targetId, name: 'Rent', amount: 1600 },
      })

      expect(next.fixed[0].amount).toBe(1600)
      expect(next.fixed[1].amount).toBe(100)
    })
  })

  describe('REMOVE_ITEM', () => {
    it('removes only the specified item', () => {
      let next = guidedBudgetReducer(state, {
        type: 'ADD_ITEM',
        payload: { category: 'savings', name: 'Emergency', amount: 200 },
      })
      next = guidedBudgetReducer(next, {
        type: 'ADD_ITEM',
        payload: { category: 'savings', name: '401k', amount: 300 },
      })
      const removeId = next.savings[0].id

      next = guidedBudgetReducer(next, {
        type: 'REMOVE_ITEM',
        payload: { category: 'savings', id: removeId },
      })

      expect(next.savings).toHaveLength(1)
      expect(next.savings[0].name).toBe('401k')
    })
  })

  describe('navigation', () => {
    it('NEXT_STEP advances and marks the current step complete', () => {
      const next = guidedBudgetReducer(state, { type: 'NEXT_STEP' })
      expect(next.stepIndex).toBe(1)
      expect(next.completedSteps).toContain(0)
    })

    it('PREV_STEP goes back but does not go below 0', () => {
      const atZero = guidedBudgetReducer(state, { type: 'PREV_STEP' })
      expect(atZero.stepIndex).toBe(0)

      const advanced = guidedBudgetReducer(state, { type: 'GO_TO_STEP', payload: { stepIndex: 2 } })
      const back = guidedBudgetReducer(advanced, { type: 'PREV_STEP' })
      expect(back.stepIndex).toBe(1)
    })

    it('NEXT_STEP does not advance beyond the summary step', () => {
      const atSummary = guidedBudgetReducer(state, {
        type: 'GO_TO_STEP',
        payload: { stepIndex: SUMMARY_STEP_INDEX },
      })
      const next = guidedBudgetReducer(atSummary, { type: 'NEXT_STEP' })
      expect(next.stepIndex).toBe(SUMMARY_STEP_INDEX)
    })

    it('GO_TO_STEP clamps out-of-range indices', () => {
      const tooHigh = guidedBudgetReducer(state, {
        type: 'GO_TO_STEP',
        payload: { stepIndex: 99 },
      })
      expect(tooHigh.stepIndex).toBe(SUMMARY_STEP_INDEX)

      const tooLow = guidedBudgetReducer(state, {
        type: 'GO_TO_STEP',
        payload: { stepIndex: -5 },
      })
      expect(tooLow.stepIndex).toBe(0)
    })
  })

  describe('COMPLETE_STEP', () => {
    it('records completed steps without duplicates and sorted', () => {
      let next = guidedBudgetReducer(state, {
        type: 'COMPLETE_STEP',
        payload: { stepIndex: 2 },
      })
      next = guidedBudgetReducer(next, { type: 'COMPLETE_STEP', payload: { stepIndex: 0 } })
      next = guidedBudgetReducer(next, { type: 'COMPLETE_STEP', payload: { stepIndex: 2 } })

      expect(next.completedSteps).toEqual([0, 2])
    })
  })

  describe('SET_QUICK_MODE', () => {
    it('toggles quick mode', () => {
      const on = guidedBudgetReducer(state, {
        type: 'SET_QUICK_MODE',
        payload: { enabled: true },
      })
      expect(on.quickMode).toBe(true)
    })
  })

  describe('HYDRATE', () => {
    it('replaces the entire state', () => {
      const payload: GuidedBudgetState = {
        income: [{ id: '1', name: 'Salary', amount: 5000 }],
        fixed: [],
        variable: [],
        savings: [],
        stepIndex: 3,
        completedSteps: [0, 1, 2],
        quickMode: true,
      }
      const next = guidedBudgetReducer(state, { type: 'HYDRATE', payload })
      expect(next).toEqual(payload)
    })
  })

  describe('RESET', () => {
    it('clears data but preserves quick-mode preference', () => {
      let next = guidedBudgetReducer(state, {
        type: 'ADD_ITEM',
        payload: { category: 'income', name: 'Salary', amount: 5000 },
      })
      next = guidedBudgetReducer(next, { type: 'SET_QUICK_MODE', payload: { enabled: true } })
      next = guidedBudgetReducer(next, { type: 'GO_TO_STEP', payload: { stepIndex: 3 } })

      const reset = guidedBudgetReducer(next, { type: 'RESET' })
      expect(reset.income).toHaveLength(0)
      expect(reset.stepIndex).toBe(0)
      expect(reset.completedSteps).toHaveLength(0)
      expect(reset.quickMode).toBe(true)
    })
  })
})

describe('categoryForStep', () => {
  it('maps step indices to categories', () => {
    expect(categoryForStep(0)).toBe('income')
    expect(categoryForStep(1)).toBe('fixed')
    expect(categoryForStep(2)).toBe('variable')
    expect(categoryForStep(3)).toBe('savings')
  })

  it('returns null for the summary step', () => {
    expect(categoryForStep(SUMMARY_STEP_INDEX)).toBeNull()
  })
})
