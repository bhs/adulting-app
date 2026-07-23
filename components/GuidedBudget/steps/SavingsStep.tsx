'use client'

import { LineItem } from '@/lib/budget/guided/types'
import { SAVINGS_TARGET } from '@/lib/budget/guided/calculations'
import { EducationContent } from '../EducationCard'
import { StepLayout } from '../StepLayout'
import { LineItemEditor } from '../LineItemEditor'
import { RuleOfThumbGauge } from '../RuleOfThumbGauge'
import { SavingsRateSlider } from '../SavingsRateSlider'

const EDUCATION: EducationContent = {
  explanation:
    'Savings is money you deliberately set aside — an emergency fund, retirement contributions, and goals like a house or travel. Treat it as a bill you pay to your future self.',
  whyItMatters:
    'Paying yourself first — saving before you spend on wants — is the habit that separates people who build wealth from those who don\'t. Thanks to compounding, money saved early is worth far more later.',
  commonMistake:
    'Saving only "whatever is left over" at the end of the month. There\'s usually nothing left. Automating savings up front makes it happen consistently.',
}

interface SavingsStepProps {
  items: LineItem[]
  income: number
  quickMode: boolean
  onAdd: (name: string, amount: number) => void
  onUpdate: (id: string, name: string, amount: number) => void
  onRemove: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function SavingsStep({
  items,
  income,
  quickMode,
  onAdd,
  onUpdate,
  onRemove,
  onNext,
  onBack,
}: SavingsStepProps) {
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <StepLayout
      title="Step 4: Savings"
      subtitle="Finally, the money you pay to your future self."
      education={EDUCATION}
      quickMode={quickMode}
      interactive={
        <>
          <RuleOfThumbGauge
            title="The 20% rule"
            description="The 50/30/20 rule suggests putting at least 20% of your take-home income toward savings."
            actual={total}
            income={income}
            targetPercent={SAVINGS_TARGET}
            goal="reach"
          />
          <SavingsRateSlider monthlyIncome={income} />
        </>
      }
      onNext={onNext}
      onBack={onBack}
      nextLabel="See My Results →"
    >
      <LineItemEditor
        items={items}
        nameLabel="Savings goal"
        namePlaceholder="e.g., Emergency fund, 401(k)"
        listTitle="Your savings"
        emptyStateHint="Add money you set aside for the future, like an emergency fund, retirement, or a big goal."
        totalTone="green"
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </StepLayout>
  )
}
