// Uses the global describe/it/expect/jest (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stage2Income } from '../Stage2Income'
import { IncomeSource } from '@/lib/budget/types'

const income: IncomeSource[] = [
  { id: 'i1', name: 'Salary', amount: 5000 },
  { id: 'i2', name: 'Freelance', amount: 1000 },
]

function setup(
  overrides: Partial<React.ComponentProps<typeof Stage2Income>> = {}
) {
  const props = {
    income: [] as IncomeSource[],
    onAddIncome: jest.fn(),
    onUpdateIncome: jest.fn(),
    onRemoveIncome: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  }
  render(<Stage2Income {...props} />)
  return props
}

describe('Stage2Income', () => {
  it('adds a valid income source', async () => {
    const props = setup()
    await userEvent.type(screen.getByLabelText('Source'), 'Salary')
    await userEvent.type(screen.getByLabelText('Amount'), '5000')
    await userEvent.click(screen.getByRole('button', { name: 'Add Income' }))
    expect(props.onAddIncome).toHaveBeenCalledWith('Salary', 5000)
  })

  it('ignores invalid submissions', async () => {
    const props = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Add Income' }))
    expect(props.onAddIncome).not.toHaveBeenCalled()
  })

  it('lists existing income sources and their total', () => {
    setup({ income })
    expect(screen.getByText('Salary')).toBeInTheDocument()
    // Total of 5000 + 1000 = 6000.
    expect(screen.getByText('$6,000')).toBeInTheDocument()
  })

  it('edits and updates an income source', async () => {
    const props = setup({ income })
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1])

    const nameInput = screen.getByLabelText('Source') as HTMLInputElement
    expect(nameInput.value).toBe('Freelance')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Consulting')
    await userEvent.click(screen.getByRole('button', { name: 'Update Income' }))

    expect(props.onUpdateIncome).toHaveBeenCalledWith('i2', 'Consulting', 1000)
  })

  it('cancels an edit', async () => {
    setup({ income })
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect((screen.getByLabelText('Source') as HTMLInputElement).value).toBe('')
  })

  it('removes an income source', async () => {
    const props = setup({ income })
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    expect(props.onRemoveIncome).toHaveBeenCalledWith('i1')
  })

  it('navigates back', async () => {
    const props = setup({ income })
    await userEvent.click(screen.getByRole('button', { name: /Back/ }))
    expect(props.onBack).toHaveBeenCalledTimes(1)
  })

  it('disables Next when there is no income, enables it otherwise', async () => {
    const props = setup({ income })
    const next = screen.getByRole('button', { name: /Next: See Your Results/ })
    expect(next).toBeEnabled()
    await userEvent.click(next)
    expect(props.onNext).toHaveBeenCalledTimes(1)
  })

  it('disables Next when income is empty', () => {
    setup()
    expect(
      screen.getByRole('button', { name: /Next: See Your Results/ })
    ).toBeDisabled()
  })
})
