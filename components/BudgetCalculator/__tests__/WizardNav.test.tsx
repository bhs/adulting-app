// Uses the global describe/it/expect/jest (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WizardNav } from '../WizardNav'

describe('WizardNav', () => {
  it('renders all three stage titles', () => {
    render(
      <WizardNav
        currentStage={1}
        completedStages={new Set()}
        onStageClick={jest.fn()}
      />
    )
    expect(screen.getByText("What You're Spending")).toBeInTheDocument()
    expect(screen.getByText("What You're Making")).toBeInTheDocument()
    expect(screen.getByText('How You Get There')).toBeInTheDocument()
  })

  it('allows clicking stage 1 (always clickable)', async () => {
    const onStageClick = jest.fn()
    render(
      <WizardNav
        currentStage={2}
        completedStages={new Set()}
        onStageClick={onStageClick}
      />
    )
    await userEvent.click(screen.getByText("What You're Spending"))
    expect(onStageClick).toHaveBeenCalledWith(1)
  })

  it('disables uncompleted, non-first stages', async () => {
    const onStageClick = jest.fn()
    render(
      <WizardNav
        currentStage={1}
        completedStages={new Set()}
        onStageClick={onStageClick}
      />
    )
    // Stage 3 is neither completed nor the first stage, so it is disabled.
    const stage3Button = screen.getByText('How You Get There').closest('button')
    expect(stage3Button).toBeDisabled()
    await userEvent.click(stage3Button as HTMLButtonElement)
    expect(onStageClick).not.toHaveBeenCalled()
  })

  it('allows clicking a completed stage', async () => {
    const onStageClick = jest.fn()
    render(
      <WizardNav
        currentStage={3}
        completedStages={new Set([1, 2])}
        onStageClick={onStageClick}
      />
    )
    await userEvent.click(screen.getByText("What You're Making"))
    expect(onStageClick).toHaveBeenCalledWith(2)
  })

  it('shows a checkmark icon for completed stages that are not current', () => {
    const { container } = render(
      <WizardNav
        currentStage={3}
        completedStages={new Set([1, 2])}
        onStageClick={jest.fn()}
      />
    )
    // Completed stages 1 and 2 render an SVG checkmark instead of a number.
    expect(container.querySelectorAll('svg').length).toBe(2)
  })
})
