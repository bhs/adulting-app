// Uses the global describe/it/expect (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetCalculator } from '../BudgetCalculator'

/**
 * Integration test that drives the wizard end-to-end through the real reducer,
 * covering the stage-transition handlers in BudgetCalculator that unit tests
 * on individual stages cannot reach.
 */
describe('BudgetCalculator (integration)', () => {
  async function addExpense(name: string, amount: string) {
    await userEvent.type(screen.getByLabelText('Category'), name)
    await userEvent.type(screen.getByLabelText('Amount'), amount)
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }))
  }

  async function addIncome(name: string, amount: string) {
    await userEvent.type(screen.getByLabelText('Source'), name)
    await userEvent.type(screen.getByLabelText('Amount'), amount)
    await userEvent.click(screen.getByRole('button', { name: 'Add Income' }))
  }

  it('walks through all three stages and computes a result', async () => {
    render(<BudgetCalculator />)

    // Stage 1: spending.
    expect(
      screen.getByRole('heading', { name: "What You're Spending" })
    ).toBeInTheDocument()
    await addExpense('Rent', '1500')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )

    // Stage 2: income.
    expect(
      screen.getByRole('heading', { name: "What You're Making" })
    ).toBeInTheDocument()
    await addIncome('Salary', '5000')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: See Your Results/ })
    )

    // Stage 3: results — surplus of 3500.
    expect(
      screen.getByRole('heading', { name: 'How You Get There' })
    ).toBeInTheDocument()
    expect(screen.getByText('Monthly Surplus')).toBeInTheDocument()
    expect(screen.getByText('$3,500')).toBeInTheDocument()
  })

  it('navigates backward through completed stages', async () => {
    render(<BudgetCalculator />)

    await addExpense('Rent', '1500')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )
    await addIncome('Salary', '5000')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: See Your Results/ })
    )

    // From results, go back to income.
    await userEvent.click(screen.getByRole('button', { name: /← Back/ }))
    expect(
      screen.getByRole('heading', { name: "What You're Making" })
    ).toBeInTheDocument()

    // From income, go back to spending.
    await userEvent.click(screen.getByRole('button', { name: /← Back/ }))
    expect(
      screen.getByRole('heading', { name: "What You're Spending" })
    ).toBeInTheDocument()
  })

  it('resets the wizard from the results screen', async () => {
    render(<BudgetCalculator />)

    await addExpense('Rent', '1500')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )
    await addIncome('Salary', '5000')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: See Your Results/ })
    )

    await userEvent.click(screen.getByRole('button', { name: 'Start Over' }))

    // Back to a fresh stage 1 with no expenses carried over.
    expect(
      screen.getByRole('heading', { name: "What You're Spending" })
    ).toBeInTheDocument()
    expect(screen.queryByText('Rent')).not.toBeInTheDocument()
  })

  it('supports editing and removing entries wired through the reducer', async () => {
    render(<BudgetCalculator />)

    // Add two expenses, then edit the first and remove the second.
    await addExpense('Rent', '1500')
    await addExpense('Gym', '50')

    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    const category = screen.getByLabelText('Category') as HTMLInputElement
    await userEvent.clear(category)
    await userEvent.type(category, 'Mortgage')
    await userEvent.click(
      screen.getByRole('button', { name: 'Update Expense' })
    )
    expect(screen.getByText('Mortgage')).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1])
    expect(screen.queryByText('Gym')).not.toBeInTheDocument()

    // Move to income and exercise the same update path there.
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )
    await addIncome('Salary', '5000')
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const source = screen.getByLabelText('Source') as HTMLInputElement
    await userEvent.clear(source)
    await userEvent.type(source, 'Consulting')
    await userEvent.click(screen.getByRole('button', { name: 'Update Income' }))
    expect(screen.getByText('Consulting')).toBeInTheDocument()
  })

  it('lets the user jump to a completed stage via the nav', async () => {
    render(<BudgetCalculator />)

    await addExpense('Rent', '1500')
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )

    // Stage 1 is now completed and clickable in the nav.
    await userEvent.click(screen.getByText("What You're Spending"))
    expect(
      screen.getByRole('button', { name: 'Add Expense' })
    ).toBeInTheDocument()
  })
})
