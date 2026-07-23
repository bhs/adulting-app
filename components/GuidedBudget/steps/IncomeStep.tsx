'use client'

import { LineItem } from '@/lib/budget/guided/types'
import { EducationContent } from '../EducationCard'
import { StepLayout } from '../StepLayout'
import { LineItemEditor } from '../LineItemEditor'
import { SavingsRateSlider } from '../SavingsRateSlider'

/**
 * Educational content for the income step. Co-located with the component so the
 * lesson and the UI evolve together.
 */
const EDUCATION: EducationContent = {
  explanation:
    'Income is all the money you reliably bring in each month — your take-home pay after taxes, plus any side income. Everything else in your budget is built on this number.',
  whyItMatters:
    'Budgeting from your net (take-home) pay, not your gross salary, keeps your plan grounded in money you can actually spend. It also sets the ceiling for every other category.',
  commonMistake:
    'Budgeting from your gross salary or counting irregular bonuses as guaranteed income. This makes every other number optimistic and leaves you short at month-end.',
}

interface IncomeStepProps {
  items: LineItem[]
  quickMode: boolean
  onAdd: (name: string, amount: number) => void
  onUpdate: (id: string, name: string, amount: number) => void
  onRemove: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function IncomeStep({
  items,
  quickMode,
  onAdd,
  onUpdate,
  onRemove,
  onNext,
  onBack,
}: IncomeStepProps) {
  const totalIncome = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <StepLayout
      title="Step 1: Your Income"
      subtitle="Let's start with the money coming in each month."
      education={EDUCATION}
      quickMode={quickMode}
      interactive={<SavingsRateSlider monthlyIncome={totalIncome} />}
      onNext={onNext}
      onBack={onBack}
      isFirst
      nextLabel="Next: Fixed Expenses →"
      canGoNext={items.length > 0}
    >
      <LineItemEditor
        items={items}
        nameLabel="Income source"
        namePlaceholder="e.g., Salary, Freelance"
        listTitle="Your income sources"
        totalTone="green"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </StepLayout>
  )
}
