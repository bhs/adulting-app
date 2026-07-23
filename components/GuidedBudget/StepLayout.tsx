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
  /** Friendly nudge shown when the user can't advance yet (canGoNext=false). */
  disabledHint?: string
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
  disabledHint,
}: StepLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-balance">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>

        {!quickMode && <EducationCard content={education} />}
        {!quickMode && interactive}

        {children}

        {/* Gentle nudge when the step isn't complete yet, so a disabled Continue
            button never leaves the user wondering what to do next. */}
        {!canGoNext && disabledHint && (
          <p className="text-sm text-amber-700 mb-3 flex items-center gap-1.5">
            <span aria-hidden="true">👆</span>
            {disabledHint}
          </p>
        )}

        {/*
         * On phones the navigation sticks to the bottom of the viewport so the
         * primary action is always within thumb reach; on larger screens it
         * returns to a normal inline row.
         */}
        <div className="flex items-center gap-3 mt-6 sm:mt-2 sm:justify-between max-sm:sticky max-sm:bottom-0 max-sm:-mx-4 max-sm:border-t max-sm:border-gray-200 max-sm:bg-gray-50/95 max-sm:px-4 max-sm:py-3 max-sm:backdrop-blur">
          {!isFirst ? (
            <Button onClick={onBack} variant="outline" className="px-6">
              ← Back
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <Button
            onClick={onNext}
            variant="primary"
            disabled={!canGoNext}
            className="flex-1 sm:flex-none sm:px-8"
          >
            {nextLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
