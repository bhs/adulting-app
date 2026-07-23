'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/Button'
import { EducationCard, EducationContent } from './EducationCard'

interface StepLayoutProps {
  title: string
  subtitle: string
  /** Educational content for this step; hidden when quick mode is on. */
  education: EducationContent
  quickMode: boolean
  /** Optional interactive element (e.g. the savings-rate slider). */
  interactive?: React.ReactNode
  children: React.ReactNode
  onNext: () => void
  onBack: () => void
  /** Hide the back button on the first step. */
  isFirst?: boolean
  nextLabel?: string
  canGoNext?: boolean
}

/**
 * Shared scaffold for every wizard step: heading, (optional) educational card
 * and mini-challenge, the step's interactive body, and navigation controls.
 */
export function StepLayout({
  title,
  subtitle,
  education,
  quickMode,
  interactive,
  children,
  onNext,
  onBack,
  isFirst = false,
  nextLabel = 'Continue →',
  canGoNext = true,
}: StepLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>

        {!quickMode && <EducationCard content={education} />}
        {!quickMode && interactive}

        {children}

        <div className="flex justify-between mt-2">
          {!isFirst ? (
            <Button onClick={onBack} variant="outline" className="px-6">
              ← Back
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onNext} variant="primary" disabled={!canGoNext} className="px-8">
            {nextLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
