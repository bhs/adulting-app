'use client'

import { ReactNode, useState } from 'react'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  stepNumber: number
  isCompleted?: boolean
}

export default function Accordion({
  title,
  children,
  defaultExpanded = false,
  stepNumber,
  isCompleted = false,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-gray-300 rounded-lg mb-4 bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isCompleted ? '✓' : stepNumber}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <svg
          className={`w-6 h-6 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200">{children}</div>
      )}
    </div>
  )
}
