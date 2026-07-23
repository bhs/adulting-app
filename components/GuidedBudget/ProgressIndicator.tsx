'use client'

interface Step {
  title: string
  shortTitle: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (stepIndex: number) => void
}

/**
 * Sticky wizard progress bar. Shows every step, marks completed ones, and lets
 * the user jump back to any step they've already visited.
 */
export function ProgressIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressIndicatorProps) {
  const progressPercent =
    steps.length > 1 ? (Math.min(currentStep, steps.length - 1) / (steps.length - 1)) * 100 : 0
  const activeStep = steps[Math.min(currentStep, steps.length - 1)]

  return (
    <nav
      aria-label="Wizard progress"
      className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm"
    >
      {/* Concise, always-accurate status for screen readers. */}
      <p className="sr-only" aria-live="polite">
        Step {Math.min(currentStep, steps.length - 1) + 1} of {steps.length}
        {activeStep ? `: ${activeStep.title}` : ''}
      </p>
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Progress track */}
        <div className="relative mb-4">
          <div
            className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gray-200"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            aria-hidden="true"
          />
          <ol className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index)
              const isCurrent = currentStep === index
              const isClickable = isCompleted || index <= currentStep
              const stateLabel = isCurrent
                ? 'current step'
                : isCompleted
                  ? 'completed'
                  : 'not yet available'

              return (
                <li key={step.title} className="flex">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${index + 1}, ${step.title}, ${stateLabel}`}
                    // Negative margin + padding expands the tap target to a
                    // thumb-friendly ~48px without enlarging the visual dot.
                    className="-m-2 p-2 rounded-full disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <span
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        transition-all
                        ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                        ${isCompleted && !isCurrent ? 'bg-green-600 text-white' : ''}
                        ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                      `}
                    >
                      {isCompleted && !isCurrent ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Step labels */}
        <div className="flex justify-between text-xs">
          {steps.map((step, index) => {
            const isCurrent = currentStep === index
            return (
              <span
                key={step.title}
                className={`flex-1 text-center ${isCurrent ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}
              >
                {step.shortTitle}
              </span>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
