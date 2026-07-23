'use client'

import { motion } from 'framer-motion'
import { GuidedBudgetState } from '@/lib/budget/guided/types'
import {
  calculateTotals,
  calculateHealthScore,
  formatCurrency,
  formatPercentage,
  HealthStatus,
} from '@/lib/budget/guided/calculations'
import { Button } from '@/components/Button'
import { AnimatedNumber } from '@/components/AnimatedNumber'

interface SummaryDashboardProps {
  state: GuidedBudgetState
  onBack: () => void
  onReset: () => void
}

const gradeColors: Record<string, string> = {
  A: 'from-green-500 to-emerald-600',
  B: 'from-green-500 to-teal-600',
  C: 'from-yellow-500 to-amber-600',
  D: 'from-orange-500 to-red-500',
  F: 'from-red-500 to-rose-600',
}

const statusStyles: Record<HealthStatus, { dot: string; badge: string; label: string }> = {
  good: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700', label: 'Good' },
  warning: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700', label: 'Watch' },
  poor: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700', label: 'Needs work' },
}

export function SummaryDashboard({ state, onBack, onReset }: SummaryDashboardProps) {
  const totals = calculateTotals(state)
  const health = calculateHealthScore(state)

  const categories = [
    { key: 'income', label: 'Income', value: totals.income, tone: 'text-green-600' },
    { key: 'fixed', label: 'Fixed expenses', value: totals.fixed, tone: 'text-red-600' },
    { key: 'variable', label: 'Variable spending', value: totals.variable, tone: 'text-red-600' },
    { key: 'savings', label: 'Savings', value: totals.savings, tone: 'text-blue-600' },
  ]

  const leftoverPositive = totals.leftover >= 0

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Budget Summary</h2>
        <p className="text-gray-600 mb-8">
          Here&apos;s your complete monthly plan and what it says about your financial health.
        </p>

        {/* Financial health score */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Score</h3>
          <div className="flex items-center gap-6">
            <div
              className={`flex-shrink-0 w-28 h-28 rounded-full bg-gradient-to-br ${
                gradeColors[health.grade]
              } flex flex-col items-center justify-center text-white shadow-md`}
            >
              <AnimatedNumber
                value={health.overall}
                durationMs={900}
                className="text-4xl font-black leading-none tabular-nums"
              />
              <div className="text-sm font-semibold mt-1">Grade {health.grade}</div>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${health.overall}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className={`h-full bg-gradient-to-r ${gradeColors[health.grade]}`}
                />
              </div>
              <p className="text-sm text-gray-600">
                Your score blends your savings rate, cash flow, and how your spending compares to
                the 50/30/20 rule. Here&apos;s the breakdown:
              </p>
            </div>
          </div>

          {/* Metric breakdown with explanations */}
          <div className="mt-6 space-y-3">
            {health.metrics.map((metric, index) => {
              const style = statusStyles[metric.status]
              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} aria-hidden="true" />
                      <span className="font-medium text-gray-900">{metric.label}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{metric.explanation}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Category totals */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {categories.map((cat) => (
            <div key={cat.key} className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">{cat.label}</div>
              <AnimatedNumber
                value={cat.value}
                format={formatCurrency}
                className={`block text-xl font-bold tabular-nums ${cat.tone}`}
              />
            </div>
          ))}
        </motion.div>

        {/* Leftover / balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`rounded-lg shadow-md p-6 mb-8 border-2 ${
            leftoverPositive ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">
                {leftoverPositive ? 'Unallocated each month' : 'Over budget each month'}
              </div>
              <div className="text-sm text-gray-600">
                Savings rate: {formatPercentage(totals.savingsRate)}
              </div>
            </div>
            <AnimatedNumber
              value={Math.abs(totals.leftover)}
              format={formatCurrency}
              className={`text-3xl font-bold tabular-nums ${leftoverPositive ? 'text-green-600' : 'text-red-600'}`}
            />
          </div>
          {leftoverPositive && totals.leftover > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              You have {formatCurrency(totals.leftover)} unassigned. Consider directing it toward
              savings to boost your score and your future.
            </p>
          )}
          {!leftoverPositive && (
            <p className="text-sm text-gray-600 mt-3">
              Your plan spends more than you earn. Revisit a step to trim expenses or adjust your
              savings target until this balances.
            </p>
          )}
        </motion.div>

        {/* Full breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Full breakdown</h3>
          <div className="space-y-5">
            {categories.map((cat) => {
              const items = state[cat.key as keyof GuidedBudgetState] as GuidedBudgetState['income']
              if (!Array.isArray(items) || items.length === 0) return null
              return (
                <div key={cat.key}>
                  <h4 className="font-medium text-gray-700 mb-2">{cat.label}</h4>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="px-8">
            ← Back
          </Button>
          <Button onClick={onReset} variant="secondary" className="px-8">
            Start Over
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
