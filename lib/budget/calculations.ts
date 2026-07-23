import { BudgetState } from './types'

export interface BudgetSummary {
  totalExpenses: number
  totalIncome: number
  surplus: number
  savingsRate: number
  points: number
}

const POINTS_MULTIPLIER = 0.1 // 1 point per $10 surplus

export function calculateBudgetSummary(state: BudgetState): BudgetSummary {
  const totalExpenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncome = state.income.reduce((sum, income) => sum + income.amount, 0)
  const surplus = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0
  const points = surplus > 0 ? Math.floor(surplus * POINTS_MULTIPLIER) : 0

  return {
    totalExpenses,
    totalIncome,
    surplus,
    savingsRate,
    points,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
