// NOTE: `jest` is intentionally the global (not imported from '@jest/globals').
// Under next/jest's SWC transform, importing `jest` disables jest.mock()
// hoisting, so a statically-imported subject would bind to the real module
// before the mock is registered.
import { render, screen } from '@testing-library/react'

// Mock telemetry + session dependencies so we only test wiring behavior.
// The jest.fn()s are created inside the factories (which run before this
// file's top-level consts), then read back from the mocked modules below.
jest.mock('@/lib/telemetry', () => ({ initializeTelemetry: jest.fn() }))
jest.mock('@/lib/analytics', () => ({
  SessionManager: {
    startSession: jest.fn(),
    endSession: jest.fn(),
  },
}))

import { ClientLayout } from '../ClientLayout'
import { initializeTelemetry } from '@/lib/telemetry'
import { SessionManager } from '@/lib/analytics'

const startSession = SessionManager.startSession as jest.Mock
const endSession = SessionManager.endSession as jest.Mock

describe('ClientLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders its children', () => {
    render(
      <ClientLayout>
        <span>Page content</span>
      </ClientLayout>
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('initializes telemetry and starts a session on mount', () => {
    render(
      <ClientLayout>
        <span>content</span>
      </ClientLayout>
    )
    expect(initializeTelemetry).toHaveBeenCalledTimes(1)
    expect(startSession).toHaveBeenCalledTimes(1)
  })

  it('ends the session on unmount', () => {
    const { unmount } = render(
      <ClientLayout>
        <span>content</span>
      </ClientLayout>
    )
    expect(endSession).not.toHaveBeenCalled()
    unmount()
    expect(endSession).toHaveBeenCalled()
  })

  it('ends the session on beforeunload', () => {
    render(
      <ClientLayout>
        <span>content</span>
      </ClientLayout>
    )
    endSession.mockClear()
    window.dispatchEvent(new Event('beforeunload'))
    expect(endSession).toHaveBeenCalledTimes(1)
  })
})
