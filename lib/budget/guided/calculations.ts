import { GuidedBudgetState, LineItem } from './types'

/** Aggregated totals derived from the four budget categories. */
export interface BudgetTotals {
  income: number
  fixed: number
  variable: number
  savings: number
  /** income - (fixed + variable + savings). Positive means unallocated money. */
  leftover: number
  /** savings / income, as a percentage (0 when income is 0). */
  savingsRate: number
}

export type HealthStatus = 'good' | 'warning' | 'poor'

/** A single component of the financial health score. */
export interface HealthMetric {
  key: string
  label: string
  /** The user's actual value for this metric, as a percentage. */
  actual: number
  /** The target value this metric is measured against, as a percentage. */
  target: number
  /** 0-100 sub-score for this metric. */
  score: number
  status: HealthStatus
  /** Plain-language explanation shown next to the metric. */
  explanation: string
}

export interface HealthScore {
  /** Overall weighted score, 0-100. */
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  metrics: HealthMetric[]
}

/** Annualized real return assumption used for long-term wealth projections. */
export const ASSUMED_ANNUAL_RETURN = 0.07

/** Target allocations from the classic 50/30/20 budgeting rule. */
export const NEEDS_TARGET = 50
export const WANTS_TARGET = 30
export const SAVINGS_TARGET = 20

function sum(items: LineItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function calculateTotals(state: GuidedBudgetState): BudgetTotals {
  const income = sum(state.income)
  const fixed = sum(state.fixed)
  const variable = sum(state.variable)
  const savings = sum(state.savings)
  const leftover = income - (fixed + variable + savings)
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  return { income, fixed, variable, savings, leftover, savingsRate }
}

/**
 * Score a "lower is better" ratio (needs/wants) against a target. At or below
 * the target scores 100; the score degrades as spending exceeds the target and
 * hits 0 once spending is roughly double the target.
 */
function scoreCappedRatio(actual: number, target: number): number {
  if (actual <= target) return 100
  const overage = actual - target
  return clamp(100 - (overage / target) * 100, 0, 100)
}

/**
 * Score a "higher is better" ratio (savings) against a target. Meeting the
 * target scores 100 and scales linearly below it.
 */
function scoreTowardTarget(actual: number, target: number): number {
  if (target <= 0) return 100
  return clamp((actual / target) * 100, 0, 100)
}

function statusForScore(score: number): HealthStatus {
  if (score >= 80) return 'good'
  if (score >= 50) return 'warning'
  return 'poor'
}

function gradeForScore(score: number): HealthScore['grade'] {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Computes a financial health score based on the 50/30/20 rule plus a cash-flow
 * check. Each metric contributes a weighted portion of the overall score and
 * carries a plain-language explanation for the dashboard.
 */
export function calculateHealthScore(state: GuidedBudgetState): HealthScore {
  const totals = calculateTotals(state)
  const { income, fixed, variable, savings, leftover } = totals

  // Guard against a zero-income budget: nothing meaningful to score yet.
  if (income <= 0) {
    const metrics: HealthMetric[] = [
      {
        key: 'income',
        label: 'Add your income',
        actual: 0,
        target: 0,
        score: 0,
        status: 'poor',
        explanation: 'Enter your income to unlock your financial health score.',
      },
    ]
    return { overall: 0, grade: 'F', metrics }
  }

  const needsRatio = (fixed / income) * 100
  const wantsRatio = (variable / income) * 100
  const savingsRatio = (savings / income) * 100

  const needsScore = scoreCappedRatio(needsRatio, NEEDS_TARGET)
  const wantsScore = scoreCappedRatio(wantsRatio, WANTS_TARGET)
  const savingsScore = scoreTowardTarget(savingsRatio, SAVINGS_TARGET)
  // Cash flow: staying within income is healthy; overspending is penalized in
  // proportion to how far past income the plan goes.
  const cashFlowScore = leftover >= 0 ? 100 : clamp(100 + (leftover / income) * 100, 0, 100)

  const metrics: HealthMetric[] = [
    {
      key: 'savings',
      label: 'Savings rate',
      actual: savingsRatio,
      target: SAVINGS_TARGET,
      score: savingsScore,
      status: statusForScore(savingsScore),
      explanation:
        savingsRatio >= SAVINGS_TARGET
          ? `You're saving ${savingsRatio.toFixed(0)}% of your income — at or above the recommended 20%. This is the single biggest driver of long-term wealth.`
          : `You're saving ${savingsRatio.toFixed(0)}% of your income. Aim for 20% to build wealth faster; even small increases compound significantly over time.`,
    },
    {
      key: 'cashflow',
      label: 'Cash flow',
      actual: (leftover / income) * 100,
      target: 0,
      score: cashFlowScore,
      status: statusForScore(cashFlowScore),
      explanation:
        leftover >= 0
          ? `Your plan leaves ${((leftover / income) * 100).toFixed(0)}% of income unallocated — you're living within your means.`
          : `Your plan spends more than you earn by ${Math.abs(leftover).toFixed(0)} per month. Trim expenses or lower your savings target until this is balanced.`,
    },
    {
      key: 'needs',
      label: 'Fixed costs (needs)',
      actual: needsRatio,
      target: NEEDS_TARGET,
      score: needsScore,
      status: statusForScore(needsScore),
      explanation:
        needsRatio <= NEEDS_TARGET
          ? `Fixed costs are ${needsRatio.toFixed(0)}% of income, within the 50% guideline. Low fixed costs give you flexibility when life changes.`
          : `Fixed costs are ${needsRatio.toFixed(0)}% of income — above the 50% guideline. High fixed commitments make your budget fragile.`,
    },
    {
      key: 'wants',
      label: 'Variable spending (wants)',
      actual: wantsRatio,
      target: WANTS_TARGET,
      score: wantsScore,
      status: statusForScore(wantsScore),
      explanation:
        wantsRatio <= WANTS_TARGET
          ? `Discretionary spending is ${wantsRatio.toFixed(0)}% of income, within the 30% guideline.`
          : `Discretionary spending is ${wantsRatio.toFixed(0)}% of income — above the 30% guideline. This is usually the easiest area to cut.`,
    },
  ]

  // Weighted blend: savings and cash flow matter most for long-term outcomes.
  const overall = Math.round(
    savingsScore * 0.35 + cashFlowScore * 0.25 + needsScore * 0.2 + wantsScore * 0.2
  )

  return { overall, grade: gradeForScore(overall), metrics }
}

/**
 * Projects the future value of a recurring monthly contribution using standard
 * compound-interest math (contributions made at the end of each month).
 *
 * @param monthlyContribution Amount saved/invested each month.
 * @param years Number of years to project.
 * @param annualReturn Assumed annualized return (default 7%).
 */
export function projectWealth(
  monthlyContribution: number,
  years: number,
  annualReturn: number = ASSUMED_ANNUAL_RETURN
): number {
  const months = Math.round(years * 12)
  if (months <= 0 || monthlyContribution <= 0) return 0

  const monthlyRate = annualReturn / 12
  if (monthlyRate === 0) {
    return monthlyContribution * months
  }

  // Future value of an ordinary annuity.
  const futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  return futureValue
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
