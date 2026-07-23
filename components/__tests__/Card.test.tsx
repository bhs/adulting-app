// Uses the global describe/it/expect (typed via @types/jest) so that
// @testing-library/jest-dom matchers (which augment the global jest.Matchers)
// are available on expect().
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders the title', () => {
    render(<Card title="My Title" />)
    expect(
      screen.getByRole('heading', { name: 'My Title' })
    ).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<Card title="Title" description="Some description" />)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('omits the description when not provided', () => {
    const { container } = render(<Card title="Title" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders children', () => {
    render(
      <Card title="Title">
        <span>Child content</span>
      </Card>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('merges a custom className onto the root element', () => {
    const { container } = render(<Card title="Title" className="extra" />)
    expect(container.firstChild).toHaveClass('extra')
  })
})
