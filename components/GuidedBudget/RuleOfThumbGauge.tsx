'use client'

import { formatCurrency } from '@/lib/budget/guided/calculations'

interface RuleOfThumbGaugeProps {
  /** Short name of the rule, e.g. "The 50% rule". */
  title: string
  /** Explanation of the guideline. */
  description: string
  /** The user's current total for this category. */
  actual: number
  /** The user's monthly income (the denominator for the ratio). */
  income: number
  /** Target share of income, as a percentage (e.g. 50). */
  targetPercent: number
  /** Whether staying below the target is good (needs/wants) or reaching it is good (savings). */
  goal: 'stay-below' | 'reach'
}

/**
 * A live gauge that compares the user's current spending/saving in a category
 * against a rule-of-thumb target (e.g. the 50/30/20 rule). It updates as the
 * user adds line items, turning an abstract guideline into instant feedback.
 */
export function RuleOfThumbGauge({
  title,
  description,
  actual,
  income,
  targetPercent,
  goal,
}: RuleOfThumbGaugeProps) {
  const actualPercent = income > 0 ? (actual / income) * 100 : 0
  const targetAmount = (income * targetPercent) / 100

  const onTrack = goal === 'stay-below' ? actualPercent <= targetPercent : actualPercent >= targetPercent

  // Cap the bar width so a large overage still renders sensibly.
  const barWidth = Math.min(actualPercent, 100)
  const targetMarkerLeft = Math.min(targetPercent, 100)

  return (
    <div className="bg-white rounded-lg shadow-md border border-indigo-100 p-6 mb-6">
      <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-1">
        <span aria-hidden="true">📐</span>
        <span>{title}</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {income <= 0 ? (
        <p className="text-sm text-gray-500 italic">
          Add your income in the first step to see how you compare to this guideline.
        </p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-1 text-sm">
            <span className="text-gray-600">
              Currently: <span className="font-semibold text-gray-900">{actualPercent.toFixed(0)}%</span>{' '}
              of income
            </span>
            <span className={onTrack ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
              {onTrack ? 'On track ✓' : 'Off target'}
            </span>
          </div>

          {/* Bar with a target marker */}
          <div className="relative h-3 rounded-full bg-gray-100 mb-2">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                onTrack ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${barWidth}%` }}
            />
            <div
              className="absolute inset-y-[-3px] w-0.5 bg-indigo-700"
              style={{ left: `${targetMarkerLeft}%` }}
              aria-hidden="true"
            />
          </div>

          <div className="text-xs text-gray-500">
            Guideline: {goal === 'stay-below' ? 'up to' : 'at least'} {targetPercent}% (
            {formatCurrency(targetAmount)}/mo)
          </div>
        </>
      )}
    </div>
  )
}
