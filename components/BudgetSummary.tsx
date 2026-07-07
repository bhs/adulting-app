'use client'

interface BudgetSummaryProps {
  totalIncome: number
  totalExpenses: number
  surplus: number
  pointsEarned: number
}

export default function BudgetSummary({
  totalIncome,
  totalExpenses,
  surplus,
  pointsEarned,
}: BudgetSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen bg-white border-l border-gray-200 shadow-lg p-6 overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Budget Summary
        </h3>
        <div className="space-y-4">
          <SummaryItem
            label="Total Income"
            amount={totalIncome}
            color="text-green-600"
          />
          <SummaryItem
            label="Total Expenses"
            amount={totalExpenses}
            color="text-red-600"
          />
          <div className="border-t border-gray-300 pt-4 mt-4">
            <SummaryItem
              label="Monthly Surplus"
              amount={surplus}
              color={surplus >= 0 ? 'text-green-600' : 'text-red-600'}
              isLarge
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Points Earned
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {pointsEarned}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {surplus > 0
                ? 'Great job! Keep building your surplus!'
                : 'Add more income or reduce expenses to earn points'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Income</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Surplus</p>
            <p
              className={`text-lg font-semibold ${
                surplus >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(surplus)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Points</p>
            <p className="text-lg font-semibold text-blue-600">
              {pointsEarned}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function SummaryItem({
  label,
  amount,
  color,
  isLarge = false,
}: {
  label: string
  amount: number
  color: string
  isLarge?: boolean
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="flex justify-between items-center">
      <span className={`${isLarge ? 'text-lg' : 'text-base'} text-gray-700`}>
        {label}
      </span>
      <span className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold ${color}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  )
}
