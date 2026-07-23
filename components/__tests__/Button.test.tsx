// Uses the global describe/it/expect/jest (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies the primary variant classes by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })

  it.each([
    ['secondary', 'bg-gray-600'],
    ['outline', 'border'],
  ] as const)('applies the %s variant classes', (variant, expectedClass) => {
    render(<Button variant={variant}>Label</Button>)
    expect(screen.getByRole('button')).toHaveClass(expectedClass)
  })

  it('merges a custom className', () => {
    render(<Button className="custom-class">Label</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards native button props such as disabled and type', () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('fires onClick when clicked', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Press</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
