'use client'

import { LineItem } from '@/lib/budget/guided/types'
import { WANTS_TARGET } from '@/lib/budget/guided/calculations'
import { EducationContent } from '../EducationCard'
import { StepLayout } from '../StepLayout'
import { LineItemEditor } from '../LineItemEditor'
import { RuleOfThumbGauge } from '../RuleOfThumbGauge'

const EDUCATION: EducationContent = {
  explanation:
    'Variable expenses change month to month and are largely up to you — groceries, dining out, entertainment, shopping, and travel. These are your "wants".',
  whyItMatters:
    'Because they flex, variable expenses are where you have the most control. Understanding this spending is the fastest way to free up money for savings without upending your life.',
  commonMistake:
    'Under-estimating variable spending because it feels small in the moment. A few coffees, rideshares, and impulse buys quietly add up to hundreds of dollars a month.',
}

interface VariableExpensesStepProps {
  items: LineItem[]
  income: number
  quickMode: boolean
  onAdd: (name: string, amount: number) => void
  onUpdate: (id: string, name: string, amount: number) => void
  onRemove: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function VariableExpensesStep({
  items,
  income,
  quickMode,
  onAdd,
  onUpdate,
  onRemove,
  onNext,
  onBack,
}: VariableExpensesStepProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <StepLayout
      title="Step 3: Variable Spending"
      subtitle="The flexible, day-to-day spending you have the most control over."
      education={EDUCATION}
      quickMode={quickMode}
      interactive={
        <RuleOfThumbGauge
          title="The 30% rule"
          description="The 50/30/20 rule suggests keeping discretionary 'wants' to about 30% of your take-home income."
          actual={total}
          income={income}
          targetPercent={WANTS_TARGET}
          goal="stay-below"
        />
      }
      onNext={onNext}
      onBack={onBack}
      nextLabel="Next: Savings →"
    >
      <LineItemEditor
        items={items}
        nameLabel="Variable expense"
        namePlaceholder="e.g., Groceries, Dining out"
        listTitle="Your variable expenses"
        totalTone="red"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </StepLayout>
  )
}
