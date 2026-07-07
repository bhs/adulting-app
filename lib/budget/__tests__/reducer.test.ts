import { describe, it, expect, beforeEach } from '@jest/globals'
import { budgetReducer, initialBudgetState } from '../reducer'
import { BudgetState } from '../types'

describe('budgetReducer', () => {
  let state: BudgetState

  beforeEach(() => {
    state = { ...initialBudgetState, completedStages: new Set<number>() }
  })

  describe('ADD_EXPENSE', () => {
    it('should add a new expense with generated id', () => {
      const newState = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })

      expect(newState.expenses).toHaveLength(1)
      expect(newState.expenses[0].name).toBe('Rent')
      expect(newState.expenses[0].amount).toBe(1500)
      expect(newState.expenses[0].id).toBeDefined()
    })

    it('should add multiple expenses', () => {
      let newState = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      newState = budgetReducer(newState, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Groceries', amount: 400 },
      })

      expect(newState.expenses).toHaveLength(2)
      expect(newState.expenses[1].name).toBe('Groceries')
    })
  })

  describe('UPDATE_EXPENSE', () => {
    it('should update an existing expense', () => {
      const stateWithExpense = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      const expenseId = stateWithExpense.expenses[0].id

      const updatedState = budgetReducer(stateWithExpense, {
        type: 'UPDATE_EXPENSE',
        payload: { id: expenseId, name: 'Rent Updated', amount: 1600 },
      })

      expect(updatedState.expenses[0].name).toBe('Rent Updated')
      expect(updatedState.expenses[0].amount).toBe(1600)
      expect(updatedState.expenses[0].id).toBe(expenseId)
    })

    it('should not modify other expenses', () => {
      let stateWithExpenses = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      stateWithExpenses = budgetReducer(stateWithExpenses, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Groceries', amount: 400 },
      })

      const firstExpenseId = stateWithExpenses.expenses[0].id

      const updatedState = budgetReducer(stateWithExpenses, {
        type: 'UPDATE_EXPENSE',
        payload: { id: firstExpenseId, name: 'Rent Updated', amount: 1600 },
      })

      expect(updatedState.expenses[1].name).toBe('Groceries')
      expect(updatedState.expenses[1].amount).toBe(400)
    })
  })

  describe('REMOVE_EXPENSE', () => {
    it('should remove an expense by id', () => {
      const stateWithExpense = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      const expenseId = stateWithExpense.expenses[0].id

      const updatedState = budgetReducer(stateWithExpense, {
        type: 'REMOVE_EXPENSE',
        payload: { id: expenseId },
      })

      expect(updatedState.expenses).toHaveLength(0)
    })

    it('should only remove the specified expense', () => {
      let stateWithExpenses = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      stateWithExpenses = budgetReducer(stateWithExpenses, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Groceries', amount: 400 },
      })

      const firstExpenseId = stateWithExpenses.expenses[0].id

      const updatedState = budgetReducer(stateWithExpenses, {
        type: 'REMOVE_EXPENSE',
        payload: { id: firstExpenseId },
      })

      expect(updatedState.expenses).toHaveLength(1)
      expect(updatedState.expenses[0].name).toBe('Groceries')
    })
  })

  describe('ADD_INCOME', () => {
    it('should add a new income source with generated id', () => {
      const newState = budgetReducer(state, {
        type: 'ADD_INCOME',
        payload: { name: 'Salary', amount: 5000 },
      })

      expect(newState.income).toHaveLength(1)
      expect(newState.income[0].name).toBe('Salary')
      expect(newState.income[0].amount).toBe(5000)
      expect(newState.income[0].id).toBeDefined()
    })

    it('should add multiple income sources', () => {
      let newState = budgetReducer(state, {
        type: 'ADD_INCOME',
        payload: { name: 'Salary', amount: 5000 },
      })
      newState = budgetReducer(newState, {
        type: 'ADD_INCOME',
        payload: { name: 'Freelance', amount: 1000 },
      })

      expect(newState.income).toHaveLength(2)
      expect(newState.income[1].name).toBe('Freelance')
    })
  })

  describe('UPDATE_INCOME', () => {
    it('should update an existing income source', () => {
      const stateWithIncome = budgetReducer(state, {
        type: 'ADD_INCOME',
        payload: { name: 'Salary', amount: 5000 },
      })
      const incomeId = stateWithIncome.income[0].id

      const updatedState = budgetReducer(stateWithIncome, {
        type: 'UPDATE_INCOME',
        payload: { id: incomeId, name: 'Salary Updated', amount: 5500 },
      })

      expect(updatedState.income[0].name).toBe('Salary Updated')
      expect(updatedState.income[0].amount).toBe(5500)
      expect(updatedState.income[0].id).toBe(incomeId)
    })
  })

  describe('REMOVE_INCOME', () => {
    it('should remove an income source by id', () => {
      const stateWithIncome = budgetReducer(state, {
        type: 'ADD_INCOME',
        payload: { name: 'Salary', amount: 5000 },
      })
      const incomeId = stateWithIncome.income[0].id

      const updatedState = budgetReducer(stateWithIncome, {
        type: 'REMOVE_INCOME',
        payload: { id: incomeId },
      })

      expect(updatedState.income).toHaveLength(0)
    })
  })

  describe('SET_STAGE', () => {
    it('should set the current stage', () => {
      const newState = budgetReducer(state, {
        type: 'SET_STAGE',
        payload: { stage: 2 },
      })

      expect(newState.currentStage).toBe(2)
    })
  })

  describe('COMPLETE_STAGE', () => {
    it('should mark a stage as completed', () => {
      const newState = budgetReducer(state, {
        type: 'COMPLETE_STAGE',
        payload: { stage: 1 },
      })

      expect(newState.completedStages.has(1)).toBe(true)
    })

    it('should mark multiple stages as completed', () => {
      let newState = budgetReducer(state, {
        type: 'COMPLETE_STAGE',
        payload: { stage: 1 },
      })
      newState = budgetReducer(newState, {
        type: 'COMPLETE_STAGE',
        payload: { stage: 2 },
      })

      expect(newState.completedStages.has(1)).toBe(true)
      expect(newState.completedStages.has(2)).toBe(true)
    })
  })

  describe('RESET', () => {
    it('should reset to initial state', () => {
      let newState = budgetReducer(state, {
        type: 'ADD_EXPENSE',
        payload: { name: 'Rent', amount: 1500 },
      })
      newState = budgetReducer(newState, {
        type: 'ADD_INCOME',
        payload: { name: 'Salary', amount: 5000 },
      })
      newState = budgetReducer(newState, {
        type: 'SET_STAGE',
        payload: { stage: 3 },
      })
      newState = budgetReducer(newState, {
        type: 'COMPLETE_STAGE',
        payload: { stage: 1 },
      })

      const resetState = budgetReducer(newState, { type: 'RESET' })

      expect(resetState.expenses).toHaveLength(0)
      expect(resetState.income).toHaveLength(0)
      expect(resetState.currentStage).toBe(1)
      expect(resetState.completedStages.size).toBe(0)
    })
  })
})
