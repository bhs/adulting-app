'use client'

import { motion } from 'framer-motion'
import { BudgetState } from '@/lib/budget/types'
import { calculateBudgetSummary, formatCurrency, formatPercentage } from '@/lib/budget/calculations'
import { Button } from '@/components/Button'

interface Stage3ResultsProps {
  budgetState: BudgetState
  onBack: () => void
  onReset: () => void
}

export function Stage3Results({ budgetState, onBack, onReset }: Stage3ResultsProps) {
  const summary = calculateBudgetSummary(budgetState)
  const hasSurplus = summary.surplus > 0

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How You Get There</h2>
        <p className="text-gray-600 mb-8">Here&apos;s your complete budget summary and savings plan.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Income</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {budgetState.income.length} source{budgetState.income.length !== 1 ? 's' : ''}
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Total Expenses</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {budgetState.expenses.length} categor{budgetState.expenses.length !== 1 ? 'ies' : 'y'}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`
            bg-gradient-to-br rounded-lg shadow-lg p-8 mb-8
            ${hasSurplus ? 'from-green-50 to-blue-50 border-2 border-green-300' : 'from-red-50 to-orange-50 border-2 border-red-300'}
          `}
        >
          <div className="text-center mb-6">
            <div className="text-gray-700 font-medium mb-2">
              {hasSurplus ? 'Monthly Surplus' : 'Monthly Deficit'}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 10 }}
              className={`text-5xl font-bold mb-4 ${hasSurplus ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(Math.abs(summary.surplus))}
            </motion.div>
            <div className="text-lg text-gray-600">
              Savings Rate: <span className="font-semibold">{formatPercentage(summary.savingsRate)}</span>
            </div>
          </div>

          {hasSurplus && summary.points > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="text-center">
                <div className="text-gray-700 font-medium mb-2">You&apos;ve Earned</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring', stiffness: 150, damping: 8 }}
                  className="relative inline-block"
                >
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500">
                    {summary.points.toLocaleString()}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.3 }}
                    className="text-xl font-bold text-gray-700 mt-1"
                  >
                    POINTS! 🎉
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.3 }}
                  className="text-sm text-gray-500 mt-2"
                >
                  1 point for every $10 saved
                </motion.div>
              </div>

              {/* Celebratory confetti-like animation */}
              <div className="relative h-16 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{
                      y: [null, 80],
                      opacity: [0, 1, 0],
                      x: [0, (i - 6) * 15],
                      rotate: [0, 360],
                    }}
                    transition={{
                      delay: 1.0 + i * 0.05,
                      duration: 1.5,
                      ease: 'easeOut',
                    }}
                    className={`
                      absolute left-1/2 top-0 w-2 h-2 rounded-full
                      ${i % 4 === 0 ? 'bg-yellow-400' : ''}
                      ${i % 4 === 1 ? 'bg-orange-400' : ''}
                      ${i % 4 === 2 ? 'bg-pink-400' : ''}
                      ${i % 4 === 3 ? 'bg-blue-400' : ''}
                    `}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {!hasSurplus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="text-center">
                <div className="text-2xl mb-3">💡</div>
                <div className="text-gray-700 font-medium mb-2">Tips to Improve Your Budget</div>
                <ul className="text-left text-sm text-gray-600 space-y-2">
                  <li>• Look for areas to reduce spending</li>
                  <li>• Consider additional income sources</li>
                  <li>• Review subscriptions and recurring expenses</li>
                  <li>• Set specific savings goals</li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Income Sources</h4>
              <div className="space-y-1">
                {budgetState.income.map((source) => (
                  <div key={source.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{source.name}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(source.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Expense Categories</h4>
              <div className="space-y-1">
                {budgetState.expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{expense.name}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
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
