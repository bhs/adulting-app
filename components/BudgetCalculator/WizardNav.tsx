'use client'

interface WizardNavProps {
  currentStage: number
  completedStages: Set<number>
  onStageClick: (stage: number) => void
}

const stages = [
  { id: 1, title: "What You're Spending" },
  { id: 2, title: "What You're Making" },
  { id: 3, title: 'How You Get There' },
]

export function WizardNav({ currentStage, completedStages, onStageClick }: WizardNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, index) => {
            const isCompleted = completedStages.has(stage.id)
            const isCurrent = currentStage === stage.id
            const isClickable = isCompleted || stage.id === 1

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && onStageClick(stage.id)}
                  disabled={!isClickable}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                    ${isCurrent ? 'bg-blue-100 text-blue-800 font-semibold' : ''}
                    ${isCompleted && !isCurrent ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
                    ${!isCompleted && !isCurrent ? 'text-gray-400 cursor-not-allowed' : ''}
                    ${isClickable && !isCurrent ? 'cursor-pointer' : ''}
                  `}
                >
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                      ${isCurrent ? 'bg-blue-600 text-white' : ''}
                      ${isCompleted && !isCurrent ? 'bg-green-600 text-white' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-gray-300 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stage.id
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm">{stage.title}</span>
                </button>
                {index < stages.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2
                      ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
