'use client'

import { useEffect, useRef } from 'react'

interface SummarySectionProps {
  totalIncome: number
  totalExpenses: number
  surplus: number
  pointsEarned: number
  hasTriggeredConfetti: boolean
  onConfettiTriggered: () => void
}

export default function SummarySection({
  totalIncome,
  totalExpenses,
  surplus,
  pointsEarned,
  hasTriggeredConfetti,
  onConfettiTriggered,
}: SummarySectionProps) {
  const prevSurplusRef = useRef<number>(surplus)

  useEffect(() => {
    const triggerConfetti = async () => {
      if (
        !hasTriggeredConfetti &&
        surplus > 0 &&
        prevSurplusRef.current <= 0
      ) {
        const confetti = (await import('canvas-confetti')).default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        onConfettiTriggered()
      }
      prevSurplusRef.current = surplus
    }

    triggerConfetti()
  }, [surplus, hasTriggeredConfetti, onConfettiTriggered])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getFinancialHealthMessage = () => {
    if (surplus > 500) {
      return {
        title: 'Excellent Financial Health!',
        message:
          "You're doing great! You have a healthy surplus. Consider investing or saving this extra money.",
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      }
    } else if (surplus > 0) {
      return {
        title: 'Good Financial Position',
        message:
          "You're covering your expenses! Try to increase your surplus for a stronger financial cushion.",
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      }
    } else if (surplus === 0) {
      return {
        title: 'Breaking Even',
        message:
          "You're covering your expenses exactly. Look for ways to increase income or reduce expenses.",
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      }
    } else {
      return {
        title: 'Budget Deficit',
        message:
          "You're spending more than you earn. Review your expenses and look for areas to cut back.",
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      }
    }
  }

  const healthStatus = getFinancialHealthMessage()

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Monthly Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-700">Total Monthly Income</span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-700">Total Monthly Expenses</span>
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-gray-900">
              Monthly Surplus/Deficit
            </span>
            <span
              className={`text-2xl font-bold ${
                surplus >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(surplus)}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-lg border ${healthStatus.borderColor} ${healthStatus.bgColor}`}
      >
        <h3 className={`text-xl font-semibold ${healthStatus.color} mb-2`}>
          {healthStatus.title}
        </h3>
        <p className="text-gray-700">{healthStatus.message}</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Points Earned</h3>
            <p className="text-blue-100 text-sm">
              Based on your monthly surplus
            </p>
          </div>
          <div className="text-5xl font-bold">{pointsEarned}</div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-400">
          <p className="text-sm text-blue-100">
            {surplus > 0
              ? `You earned ${pointsEarned} points for maintaining a positive budget!`
              : 'Achieve a positive surplus to earn points!'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Budget Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expenses as % of Income</span>
            <span className="font-semibold">
              {totalIncome > 0
                ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Savings Rate</span>
            <span className="font-semibold">
              {totalIncome > 0
                ? `${Math.max(0, (surplus / totalIncome) * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
