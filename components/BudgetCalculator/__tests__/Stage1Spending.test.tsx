// Uses the global describe/it/expect/jest (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stage1Spending } from '../Stage1Spending'
import { ExpenseCategory } from '@/lib/budget/types'

const expenses: ExpenseCategory[] = [
  { id: 'e1', name: 'Rent', amount: 1500 },
  { id: 'e2', name: 'Groceries', amount: 400 },
]

function setup(
  overrides: Partial<React.ComponentProps<typeof Stage1Spending>> = {}
) {
  const props = {
    expenses: [] as ExpenseCategory[],
    onAddExpense: jest.fn(),
    onUpdateExpense: jest.fn(),
    onRemoveExpense: jest.fn(),
    onNext: jest.fn(),
    ...overrides,
  }
  render(<Stage1Spending {...props} />)
  return props
}

describe('Stage1Spending', () => {
  it('adds a valid expense and clears the form', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Category'), 'Rent')
    await userEvent.type(screen.getByLabelText('Amount'), '1500')
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }))

    expect(props.onAddExpense).toHaveBeenCalledWith('Rent', 1500)
    expect((screen.getByLabelText('Category') as HTMLInputElement).value).toBe(
      ''
    )
  })

  it('does not add when the name is blank', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Amount'), '100')
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }))
    expect(props.onAddExpense).not.toHaveBeenCalled()
  })

  it('does not add when the amount is not positive', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Category'), 'Rent')
    await userEvent.type(screen.getByLabelText('Amount'), '0')
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }))
    expect(props.onAddExpense).not.toHaveBeenCalled()
  })

  it('lists existing expenses and their total', () => {
    setup({ expenses })
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    // Total of 1500 + 400 = 1900.
    expect(screen.getByText('$1,900')).toBeInTheDocument()
  })

  it('enters edit mode and calls onUpdateExpense on submit', async () => {
    const props = setup({ expenses })
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    const nameInput = screen.getByLabelText('Category') as HTMLInputElement
    expect(nameInput.value).toBe('Rent')

    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Mortgage')
    await userEvent.click(
      screen.getByRole('button', { name: 'Update Expense' })
    )

    expect(props.onUpdateExpense).toHaveBeenCalledWith('e1', 'Mortgage', 1500)
    // Form returns to add mode after updating.
    expect(
      screen.getByRole('button', { name: 'Add Expense' })
    ).toBeInTheDocument()
  })

  it('cancels edit mode and clears the form', async () => {
    setup({ expenses })
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect((screen.getByLabelText('Category') as HTMLInputElement).value).toBe(
      ''
    )
    expect(
      screen.getByRole('button', { name: 'Add Expense' })
    ).toBeInTheDocument()
  })

  it('removes an expense', async () => {
    const props = setup({ expenses })
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    expect(props.onRemoveExpense).toHaveBeenCalledWith('e1')
  })

  it('disables Next when there are no expenses', () => {
    setup()
    expect(
      screen.getByRole('button', { name: /Next: What You/ })
    ).toBeDisabled()
  })

  it('advances to the next stage when Next is clicked', async () => {
    const props = setup({ expenses })
    await userEvent.click(
      screen.getByRole('button', { name: /Next: What You/ })
    )
    expect(props.onNext).toHaveBeenCalledTimes(1)
  })
})
