import { describe, it, expect } from '@jest/globals'
import {
  calculateTotals,
  calculateHealthScore,
  projectWealth,
  formatCurrency,
  formatPercentage,
  ASSUMED_ANNUAL_RETURN,
} from '../calculations'
import { GuidedBudgetState } from '../types'

function makeState(overrides: Partial<GuidedBudgetState> = {}): GuidedBudgetState {
  return {
    income: [],
    fixed: [],
    variable: [],
    savings: [],
    stepIndex: 0,
    completedSteps: [],
    quickMode: false,
    ...overrides,
  }
}

describe('calculateTotals', () => {
  it('sums categories and derives leftover and savings rate', () => {
    const state = makeState({
      income: [{ id: '1', name: 'Salary', amount: 4000 }],
      fixed: [{ id: '2', name: 'Rent', amount: 1500 }],
      variable: [{ id: '3', name: 'Food', amount: 500 }],
      savings: [{ id: '4', name: 'Emergency', amount: 800 }],
    })

    const totals = calculateTotals(state)
    expect(totals.income).toBe(4000)
    expect(totals.fixed).toBe(1500)
    expect(totals.variable).toBe(500)
    expect(totals.savings).toBe(800)
    expect(totals.leftover).toBe(1200)
    expect(totals.savingsRate).toBe(20)
  })

  it('returns a 0 savings rate when income is 0', () => {
    const totals = calculateTotals(makeState())
    expect(totals.savingsRate).toBe(0)
  })
})

describe('calculateHealthScore', () => {
  it('gives a placeholder score with no income', () => {
    const health = calculateHealthScore(makeState())
    expect(health.overall).toBe(0)
    expect(health.grade).toBe('F')
    expect(health.metrics).toHaveLength(1)
  })

  it('scores a textbook 50/30/20 budget highly', () => {
    const state = makeState({
      income: [{ id: '1', name: 'Salary', amount: 5000 }],
      fixed: [{ id: '2', name: 'Rent', amount: 2500 }], // 50%
      variable: [{ id: '3', name: 'Food', amount: 1500 }], // 30%
      savings: [{ id: '4', name: 'Invest', amount: 1000 }], // 20%
    })

    const health = calculateHealthScore(state)
    expect(health.overall).toBe(100)
    expect(health.grade).toBe('A')
    expect(health.metrics.every((m) => m.status === 'good')).toBe(true)
  })

  it('penalizes overspending via cash flow', () => {
    const state = makeState({
      income: [{ id: '1', name: 'Salary', amount: 2000 }],
      fixed: [{ id: '2', name: 'Rent', amount: 2000 }],
      variable: [{ id: '3', name: 'Food', amount: 2000 }],
      savings: [],
    })

    const health = calculateHealthScore(state)
    const cashFlow = health.metrics.find((m) => m.key === 'cashflow')
    expect(cashFlow?.status).toBe('poor')
    expect(health.overall).toBeLessThan(50)
  })

  it('flags a low savings rate', () => {
    const state = makeState({
      income: [{ id: '1', name: 'Salary', amount: 5000 }],
      fixed: [{ id: '2', name: 'Rent', amount: 2000 }],
      variable: [{ id: '3', name: 'Food', amount: 1000 }],
      savings: [{ id: '4', name: 'Invest', amount: 100 }], // 2%
    })

    const health = calculateHealthScore(state)
    const savings = health.metrics.find((m) => m.key === 'savings')
    expect(savings?.actual).toBeCloseTo(2, 0)
    expect(savings?.score).toBeLessThan(50)
  })

  it('produces an overall score between 0 and 100', () => {
    const state = makeState({
      income: [{ id: '1', name: 'Salary', amount: 3000 }],
      fixed: [{ id: '2', name: 'Rent', amount: 2000 }],
      variable: [{ id: '3', name: 'Food', amount: 700 }],
      savings: [{ id: '4', name: 'Invest', amount: 100 }],
    })
    const health = calculateHealthScore(state)
    expect(health.overall).toBeGreaterThanOrEqual(0)
    expect(health.overall).toBeLessThanOrEqual(100)
  })
})

describe('projectWealth', () => {
  it('returns 0 for non-positive inputs', () => {
    expect(projectWealth(0, 10)).toBe(0)
    expect(projectWealth(100, 0)).toBe(0)
    expect(projectWealth(-100, 10)).toBe(0)
  })

  it('equals simple contributions when the return is 0', () => {
    expect(projectWealth(100, 10, 0)).toBe(100 * 120)
  })

  it('grows faster than simple contributions with a positive return', () => {
    const simple = 200 * 12 * 30
    const projected = projectWealth(200, 30, ASSUMED_ANNUAL_RETURN)
    expect(projected).toBeGreaterThan(simple)
  })

  it('computes a known future value of an ordinary annuity', () => {
    // $500/mo for 20 years at 7% -> ~$260k (annuity FV formula).
    const value = projectWealth(500, 20, 0.07)
    expect(value).toBeGreaterThan(255000)
    expect(value).toBeLessThan(265000)
  })
})

describe('formatting', () => {
  it('formats currency with no decimals', () => {
    expect(formatCurrency(1500)).toBe('$1,500')
  })

  it('formats percentages to one decimal', () => {
    expect(formatPercentage(20)).toBe('20.0%')
  })
})
