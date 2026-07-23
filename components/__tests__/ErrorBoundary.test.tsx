// NOTE: `jest` is intentionally the global (not imported from '@jest/globals').
// Under next/jest's SWC transform, importing `jest` disables jest.mock()
// hoisting, so a statically-imported subject would bind to the real module
// before the mock is registered.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the OpenTelemetry API so error reporting records against a fake span.
const mockSpan = {
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
}
const mockTracer = { startSpan: jest.fn(() => mockSpan) }

jest.mock('@opentelemetry/api', () => ({
  trace: { getTracer: jest.fn(() => mockTracer) },
  SpanStatusCode: { OK: 1, ERROR: 2 },
}))

import { ErrorBoundary } from '../ErrorBoundary'

// A component that throws during render to trip the boundary.
function Bomb({ message = 'kaboom' }: { message?: string }): JSX.Element {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>

  beforeEach(() => {
    jest.clearAllMocks()
    // React logs caught render errors to console.error; silence the noise.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>All good</span>
      </ErrorBoundary>
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders the default fallback UI and reports the error to OTel', () => {
    render(
      <ErrorBoundary>
        <Bomb message="render failed" />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(mockTracer.startSpan).toHaveBeenCalledWith(
      'error.boundary.catch',
      expect.objectContaining({
        attributes: expect.objectContaining({
          'exception.type': 'Error',
          'exception.message': 'render failed',
          'error.boundary': true,
        }),
      })
    )
    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: 2,
      message: 'render failed',
    })
    expect(mockSpan.recordException).toHaveBeenCalled()
    expect(mockSpan.end).toHaveBeenCalled()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('reloads the page when the reload button is clicked', async () => {
    const reloadMock = jest.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    await userEvent.click(screen.getByRole('button', { name: /reload page/i }))
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })
})
