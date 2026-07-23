// NOTE: `jest` is intentionally the global (not imported from '@jest/globals').
// Under next/jest's SWC transform, importing `jest` disables jest.mock()
// hoisting, so a statically-imported subject would bind to the real module
// before the mock is registered.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the analytics module so we assert on tracking calls without OTel.
// The jest.fn()s are created inside the factory (it runs before the module's
// top-level consts, so referencing outer consts here would hit a TDZ error);
// we then grab the mocked exports below.
jest.mock('@/lib/analytics', () => ({
  trackBudgetCreated: jest.fn(),
  trackCustomEvent: jest.fn(),
}))

import { AnalyticsExample } from '../AnalyticsExample'
import { trackBudgetCreated, trackCustomEvent } from '@/lib/analytics'

describe('AnalyticsExample', () => {
  let alertSpy: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    jest.clearAllMocks()
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('does not track anything when the amount is empty', async () => {
    render(<AnalyticsExample />)
    await userEvent.click(screen.getByRole('button', { name: 'Create Budget' }))
    expect(trackBudgetCreated).not.toHaveBeenCalled()
    expect(trackCustomEvent).not.toHaveBeenCalled()
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('tracks budget creation with the entered amount and category', async () => {
    render(<AnalyticsExample />)

    await userEvent.type(screen.getByPlaceholderText('100'), '250')
    await userEvent.selectOptions(screen.getByRole('combobox'), 'utilities')
    await userEvent.click(screen.getByRole('button', { name: 'Create Budget' }))

    expect(trackBudgetCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 250,
        currency: 'USD',
        category: 'utilities',
      })
    )
    expect(trackCustomEvent).toHaveBeenCalledWith(
      'budget_form_submitted',
      expect.objectContaining({ category: 'utilities', amount: 250 })
    )
    expect(alertSpy).toHaveBeenCalledWith('Budget created: $250 for utilities')
  })

  it('clears the amount input after a successful submission', async () => {
    render(<AnalyticsExample />)
    const input = screen.getByPlaceholderText('100') as HTMLInputElement

    await userEvent.type(input, '99')
    await userEvent.click(screen.getByRole('button', { name: 'Create Budget' }))

    expect(input.value).toBe('')
  })

  it('renders the Test Error button', () => {
    // The button's handler throws on click to demonstrate the ErrorBoundary;
    // that uncaught throw can't be asserted cleanly via the DOM, so we only
    // verify the control is present.
    render(<AnalyticsExample />)
    expect(
      screen.getByRole('button', { name: 'Test Error' })
    ).toBeInTheDocument()
  })
})
