'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Accordion from '@/components/Accordion'
import BudgetSummary from '@/components/BudgetSummary'
import IncomeSection from '@/components/IncomeSection'
import ExpensesSection from '@/components/ExpensesSection'
import SummarySection from '@/components/SummarySection'
import { BudgetFormData } from '@/types/budget'
import { trackCustomEvent } from '@/lib/analytics'

export default function BudgetCalculatorPage() {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [surplus, setSurplus] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    defaultValues: {
      incomeItems: [{ source: '', amount: 0, frequency: 'monthly' }],
      expenseItems: [{ category: '', amount: 0, frequency: 'monthly' }],
    },
    mode: 'onChange',
  })

  const incomeItems = watch('incomeItems')
  const expenseItems = watch('expenseItems')

  const convertToMonthly = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'weekly':
        return amount * 4.33
      case 'bi-weekly':
        return amount * 2.17
      case 'monthly':
        return amount
      case 'yearly':
        return amount / 12
      default:
        return amount
    }
  }

  const calculatePoints = (surplus: number): number => {
    if (surplus <= 0) return 0
    if (surplus < 100) return 10
    if (surplus < 300) return 25
    if (surplus < 500) return 50
    if (surplus < 1000) return 100
    return 200
  }

  useEffect(() => {
    const income = incomeItems.reduce(
      (sum, item) => sum + convertToMonthly(item.amount || 0, item.frequency),
      0
    )
    const expenses = expenseItems.reduce(
      (sum, item) => sum + convertToMonthly(item.amount || 0, item.frequency),
      0
    )
    const currentSurplus = income - expenses
    const points = calculatePoints(currentSurplus)

    setTotalIncome(income)
    setTotalExpenses(expenses)
    setSurplus(currentSurplus)
    setPointsEarned(points)

    trackCustomEvent('budget_calculation_updated', {
      totalIncome: income,
      totalExpenses: expenses,
      surplus: currentSurplus,
      pointsEarned: points,
    })
  }, [incomeItems, expenseItems])

  const handleConfettiTriggered = () => {
    setHasTriggeredConfetti(true)
    trackCustomEvent('budget_positive_surplus_achieved', {
      surplus,
      pointsEarned,
    })
  }

  const incomeComplete = incomeItems.some(
    (item) => item.source && item.amount > 0
  )
  const expensesComplete = expenseItems.some(
    (item) => item.category && item.amount > 0
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:mr-80 pb-24 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Budget Calculator
            </h1>
            <p className="text-gray-600">
              Take control of your finances by tracking your income and
              expenses. All sections are expandable and your calculations update
              in real-time.
            </p>
          </div>

          <form className="space-y-4">
            <Accordion
              title="Step 1: Add Your Income"
              stepNumber={1}
              defaultExpanded={true}
              isCompleted={incomeComplete}
            >
              <IncomeSection
                register={register}
                control={control}
                errors={errors}
              />
            </Accordion>

            <Accordion
              title="Step 2: List Your Expenses"
              stepNumber={2}
              defaultExpanded={false}
              isCompleted={expensesComplete}
            >
              <ExpensesSection
                register={register}
                control={control}
                errors={errors}
              />
            </Accordion>

            <Accordion
              title="Step 3: Review Your Budget"
              stepNumber={3}
              defaultExpanded={false}
              isCompleted={false}
            >
              <SummarySection
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                surplus={surplus}
                pointsEarned={pointsEarned}
                hasTriggeredConfetti={hasTriggeredConfetti}
                onConfettiTriggered={handleConfettiTriggered}
              />
            </Accordion>
          </form>
        </div>
      </div>

      <BudgetSummary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        surplus={surplus}
        pointsEarned={pointsEarned}
      />
    </div>
  )
}
