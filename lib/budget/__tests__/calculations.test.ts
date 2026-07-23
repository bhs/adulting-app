import { describe, it, expect } from '@jest/globals'
import {
  calculateBudgetSummary,
  formatCurrency,
  formatPercentage,
} from '../calculations'
import { BudgetState } from '../types'

describe('calculateBudgetSummary', () => {
  it('should calculate summary with surplus', () => {
    const state: BudgetState = {
      expenses: [
        { id: '1', name: 'Rent', amount: 1500 },
        { id: '2', name: 'Groceries', amount: 400 },
      ],
      income: [
        { id: '1', name: 'Salary', amount: 5000 },
        { id: '2', name: 'Freelance', amount: 1000 },
      ],
      currentStage: 1,
      completedStages: new Set<number>(),
    }

    const summary = calculateBudgetSummary(state)

    expect(summary.totalExpenses).toBe(1900)
    expect(summary.totalIncome).toBe(6000)
    expect(summary.surplus).toBe(4100)
    expect(summary.savingsRate).toBeCloseTo(68.33, 1)
    expect(summary.points).toBe(410) // 4100 * 0.1 = 410
  })

  it('should calculate summary with deficit', () => {
    const state: BudgetState = {
      expenses: [
        { id: '1', name: 'Rent', amount: 3000 },
        { id: '2', name: 'Groceries', amount: 800 },
      ],
      income: [{ id: '1', name: 'Salary', amount: 3000 }],
      currentStage: 1,
      completedStages: new Set<number>(),
    }

    const summary = calculateBudgetSummary(state)

    expect(summary.totalExpenses).toBe(3800)
    expect(summary.totalIncome).toBe(3000)
    expect(summary.surplus).toBe(-800)
    expect(summary.savingsRate).toBeCloseTo(-26.67, 1)
    expect(summary.points).toBe(0) // No points for deficit
  })

  it('should handle empty budget', () => {
    const state: BudgetState = {
      expenses: [],
      income: [],
      currentStage: 1,
      completedStages: new Set<number>(),
    }

    const summary = calculateBudgetSummary(state)

    expect(summary.totalExpenses).toBe(0)
    expect(summary.totalIncome).toBe(0)
    expect(summary.surplus).toBe(0)
    expect(summary.savingsRate).toBe(0)
    expect(summary.points).toBe(0)
  })

  it('should floor points calculation', () => {
    const state: BudgetState = {
      expenses: [{ id: '1', name: 'Rent', amount: 1000 }],
      income: [{ id: '1', name: 'Salary', amount: 2055 }],
      currentStage: 1,
      completedStages: new Set<number>(),
    }

    const summary = calculateBudgetSummary(state)

    expect(summary.surplus).toBe(1055)
    expect(summary.points).toBe(105) // floor(1055 * 0.1) = floor(105.5) = 105
  })
})

describe('formatCurrency', () => {
  it('should format positive amounts', () => {
    expect(formatCurrency(1500)).toBe('$1,500')
    expect(formatCurrency(1000000)).toBe('$1,000,000')
    expect(formatCurrency(99)).toBe('$99')
  })

  it('should format negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500')
    expect(formatCurrency(-1234)).toBe('-$1,234')
  })

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('should round to nearest dollar (half-expand, matching Intl default)', () => {
    expect(formatCurrency(1500.49)).toBe('$1,500')
    // Intl.NumberFormat rounds halves away from zero, so .5 rounds up.
    expect(formatCurrency(1500.5)).toBe('$1,501')
    expect(formatCurrency(1500.51)).toBe('$1,501')
  })
})

describe('formatPercentage', () => {
  it('should format percentages with one decimal', () => {
    expect(formatPercentage(50)).toBe('50.0%')
    expect(formatPercentage(33.333)).toBe('33.3%')
    expect(formatPercentage(66.666)).toBe('66.7%')
  })

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('should handle negative percentages', () => {
    expect(formatPercentage(-25.5)).toBe('-25.5%')
  })
})
