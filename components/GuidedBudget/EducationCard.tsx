'use client'

import { motion } from 'framer-motion'

/**
 * Educational content shown at the top of each wizard step. Each step component
 * co-locates its own content and passes it here for consistent presentation.
 */
export interface EducationContent {
  /** One-line explanation of what this category is. */
  explanation: string
  /** Why getting this category right matters for the user's finances. */
  whyItMatters: string
  /** A common mistake young adults make with this category. */
  commonMistake: string
}

interface EducationCardProps {
  content: EducationContent
}

export function EducationCard({ content }: EducationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <span aria-hidden="true">📚</span>
          <span>Learn as you go</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-gray-700 leading-relaxed">{content.explanation}</p>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
            <span aria-hidden="true">💡</span> Why it matters
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">{content.whyItMatters}</p>
        </div>

        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
          <div className="text-sm font-semibold text-rose-800 mb-1 flex items-center gap-1.5">
            <span aria-hidden="true">⚠️</span> Common mistake
          </div>
          <p className="text-sm text-rose-900 leading-relaxed">{content.commonMistake}</p>
        </div>
      </div>
    </motion.div>
  )
}
