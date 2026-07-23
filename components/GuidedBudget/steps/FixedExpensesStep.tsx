'use client'

import { LineItem } from '@/lib/budget/guided/types'
import { NEEDS_TARGET } from '@/lib/budget/guided/calculations'
import { EducationContent } from '../EducationCard'
import { StepLayout } from '../StepLayout'
import { LineItemEditor } from '../LineItemEditor'
import { RuleOfThumbGauge } from '../RuleOfThumbGauge'

const EDUCATION: EducationContent = {
  explanation:
    'Fixed expenses are the recurring bills that stay roughly the same every month — rent or mortgage, insurance, loan payments, phone, and subscriptions. These are your "needs".',
  whyItMatters:
    'Fixed costs are the hardest part of your budget to change quickly. Keeping them modest gives you room to save and absorb surprises without going into debt.',
  commonMistake:
    'Signing up for too many recurring commitments — a pricey apartment, a car loan, and a stack of subscriptions — until fixed costs eat most of your paycheck and leave no flexibility.',
}

interface FixedExpensesStepProps {
  items: LineItem[]
  income: number
  quickMode: boolean
  onAdd: (name: string, amount: number) => void
  onUpdate: (id: string, name: string, amount: number) => void
  onRemove: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function FixedExpensesStep({
  items,
  income,
  quickMode,
  onAdd,
  onUpdate,
  onRemove,
  onNext,
  onBack,
}: FixedExpensesStepProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <StepLayout
      title="Step 2: Fixed Expenses"
      subtitle="Now the bills that show up every month like clockwork."
      education={EDUCATION}
      quickMode={quickMode}
      interactive={
        <RuleOfThumbGauge
          title="The 50% rule"
          description="A common guideline is keeping fixed needs at or below 50% of your take-home income."
          actual={total}
          income={income}
          targetPercent={NEEDS_TARGET}
          goal="stay-below"
        />
      }
      onNext={onNext}
      onBack={onBack}
      nextLabel="Next: Variable Spending →"
    >
      <LineItemEditor
        items={items}
        nameLabel="Fixed expense"
        namePlaceholder="e.g., Rent, Insurance"
        listTitle="Your fixed expenses"
        totalTone="red"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </StepLayout>
  )
}
