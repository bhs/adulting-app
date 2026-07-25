import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock the OpenTelemetry API so we can assert on the emitted span events.
const mockSpan = {
  addEvent: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
}

const mockTracer = {
  startSpan: jest.fn(() => mockSpan),
}

jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn(() => mockTracer),
  },
  SpanStatusCode: {
    OK: 1,
    ERROR: 2,
  },
}))

describe('trackSsoLoginSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('records an sso_login_success span event with the provider and user', async () => {
    const { trackSsoLoginSuccess } = await import('../telemetry')

    trackSsoLoginSuccess({
      userId: 'user-1',
      email: 'teacher@school.edu',
      provider: 'google',
    })

    expect(mockTracer.startSpan).toHaveBeenCalledWith('sso.login')
    expect(mockSpan.addEvent).toHaveBeenCalledWith('sso_login_success', {
      'event.name': 'sso_login_success',
      'auth.provider': 'google',
      'user.id': 'user-1',
      'user.email': 'teacher@school.edu',
    })
    expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 }) // OK
    expect(mockSpan.end).toHaveBeenCalled()
  })

  it('omits attributes that were not provided', async () => {
    const { trackSsoLoginSuccess } = await import('../telemetry')

    trackSsoLoginSuccess({ provider: 'microsoft-entra-id' })

    expect(mockSpan.addEvent).toHaveBeenCalledWith('sso_login_success', {
      'event.name': 'sso_login_success',
      'auth.provider': 'microsoft-entra-id',
    })
  })
})

describe('trackSsoLoginFailure', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('records an sso_login_failure span event and marks the span errored', async () => {
    const { trackSsoLoginFailure } = await import('../telemetry')

    trackSsoLoginFailure({ provider: 'google', error: 'AccessDenied' })

    expect(mockSpan.addEvent).toHaveBeenCalledWith('sso_login_failure', {
      'event.name': 'sso_login_failure',
      'auth.provider': 'google',
      'auth.error': 'AccessDenied',
    })
    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: 2, // ERROR
      message: 'AccessDenied',
    })
    expect(mockSpan.end).toHaveBeenCalled()
  })
})
