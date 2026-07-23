// Uses the global describe/it/expect/jest (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stage3Results } from '../Stage3Results'
import { BudgetState } from '@/lib/budget/types'

function stateWith(
  income: { id: string; name: string; amount: number }[],
  expenses: { id: string; name: string; amount: number }[]
): BudgetState {
  return {
    income,
    expenses,
    currentStage: 3,
    completedStages: new Set([1, 2]),
  }
}

describe('Stage3Results', () => {
  it('shows a surplus with earned points', () => {
    const state = stateWith(
      [{ id: 'i1', name: 'Salary', amount: 5000 }],
      [{ id: 'e1', name: 'Rent', amount: 1500 }]
    )
    render(
      <Stage3Results
        budgetState={state}
        onBack={jest.fn()}
        onReset={jest.fn()}
      />
    )

    expect(screen.getByText('Monthly Surplus')).toBeInTheDocument()
    // Surplus 3500 -> floor(3500 * 0.1) = 350 points.
    expect(screen.getByText('350')).toBeInTheDocument()
    expect(screen.getByText('POINTS! 🎉')).toBeInTheDocument()
  })

  it('shows a deficit with improvement tips', () => {
    const state = stateWith(
      [{ id: 'i1', name: 'Salary', amount: 1000 }],
      [{ id: 'e1', name: 'Rent', amount: 2000 }]
    )
    render(
      <Stage3Results
        budgetState={state}
        onBack={jest.fn()}
        onReset={jest.fn()}
      />
    )

    expect(screen.getByText('Monthly Deficit')).toBeInTheDocument()
    expect(screen.getByText('Tips to Improve Your Budget')).toBeInTheDocument()
    expect(screen.queryByText('POINTS! 🎉')).not.toBeInTheDocument()
  })

  it('uses singular labels for a single source and category', () => {
    const state = stateWith(
      [{ id: 'i1', name: 'Salary', amount: 5000 }],
      [{ id: 'e1', name: 'Rent', amount: 1500 }]
    )
    render(
      <Stage3Results
        budgetState={state}
        onBack={jest.fn()}
        onReset={jest.fn()}
      />
    )
    expect(screen.getByText('1 source')).toBeInTheDocument()
    expect(screen.getByText('1 category')).toBeInTheDocument()
  })

  it('uses plural labels for multiple sources and categories', () => {
    const state = stateWith(
      [
        { id: 'i1', name: 'Salary', amount: 5000 },
        { id: 'i2', name: 'Freelance', amount: 1000 },
      ],
      [
        { id: 'e1', name: 'Rent', amount: 1500 },
        { id: 'e2', name: 'Groceries', amount: 400 },
      ]
    )
    render(
      <Stage3Results
        budgetState={state}
        onBack={jest.fn()}
        onReset={jest.fn()}
      />
    )
    expect(screen.getByText('2 sources')).toBeInTheDocument()
    expect(screen.getByText('2 categories')).toBeInTheDocument()
  })

  it('calls onBack and onReset from the footer buttons', async () => {
    const onBack = jest.fn()
    const onReset = jest.fn()
    const state = stateWith(
      [{ id: 'i1', name: 'Salary', amount: 5000 }],
      [{ id: 'e1', name: 'Rent', amount: 1500 }]
    )
    render(
      <Stage3Results budgetState={state} onBack={onBack} onReset={onReset} />
    )

    await userEvent.click(screen.getByRole('button', { name: /Back/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Start Over' }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
