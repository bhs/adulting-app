'use client'

import { useState } from 'react'
import {
  projectWealth,
  formatCurrency,
  ASSUMED_ANNUAL_RETURN,
} from '@/lib/budget/guided/calculations'

interface SavingsRateSliderProps {
  /** The user's monthly income, used to translate a rate into dollars saved. */
  monthlyIncome: number
}

const HORIZONS = [10, 20, 30]

/**
 * Interactive rule-of-thumb: drag a savings rate and instantly see how much
 * wealth it could grow into over 10/20/30 years (assuming a 7% annual return).
 * Makes the abstract idea of "save more" concrete and motivating.
 */
export function SavingsRateSlider({ monthlyIncome }: SavingsRateSliderProps) {
  const [rate, setRate] = useState(20)
  const monthlySavings = (monthlyIncome * rate) / 100

  return (
    <div className="bg-white rounded-lg shadow-md border border-indigo-100 p-6 mb-6">
      <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-1">
        <span aria-hidden="true">🎚️</span>
        <span>Try it: the power of your savings rate</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Drag the slider to see how much your savings could grow, assuming a{' '}
        {(ASSUMED_ANNUAL_RETURN * 100).toFixed(0)}% average annual return.
      </p>

      {monthlyIncome <= 0 ? (
        <p className="text-sm text-gray-500 italic">
          Add your income in the first step to see your personalized projection.
        </p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-1">
            <label htmlFor="savings-rate" className="text-sm font-medium text-gray-700">
              Savings rate
            </label>
            <span className="text-2xl font-bold text-indigo-600">{rate}%</span>
          </div>
          <input
            id="savings-rate"
            type="range"
            min={0}
            max={50}
            step={1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="text-sm text-gray-600 mt-1 mb-4">
            That&apos;s <span className="font-semibold">{formatCurrency(monthlySavings)}</span> saved
            each month.
          </div>

          <div className="grid grid-cols-3 gap-3">
            {HORIZONS.map((years) => (
              <div
                key={years}
                className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-center"
              >
                <div className="text-xs text-gray-500 mb-1">In {years} years</div>
                <div className="text-base font-bold text-indigo-700">
                  {formatCurrency(projectWealth(monthlySavings, years))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
