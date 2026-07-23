import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Mock the Honeycomb SDK so no real network client is constructed.
const startMock = jest.fn()
const shutdownMock = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
const HoneycombWebSDK = jest.fn().mockImplementation(() => ({
  start: startMock,
  shutdown: shutdownMock,
}))

jest.mock('@honeycombio/opentelemetry-web', () => ({
  HoneycombWebSDK,
}))

describe('telemetry (browser environment)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    HoneycombWebSDK.mockClear()
    startMock.mockClear()
    shutdownMock.mockClear()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
  })

  it('warns and skips initialization when no API key is set', async () => {
    delete process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('NEXT_PUBLIC_HONEYCOMB_API_KEY not set')
    )
    expect(HoneycombWebSDK).not.toHaveBeenCalled()
  })

  it('initializes the SDK with configured service name and environment', async () => {
    process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY = 'test-key'
    process.env.NEXT_PUBLIC_SERVICE_NAME = 'my-service'
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()

    expect(HoneycombWebSDK).toHaveBeenCalledTimes(1)
    expect(HoneycombWebSDK).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-key',
        serviceName: 'my-service',
        endpoint: 'https://api.honeycomb.io/v1/traces',
      })
    )
    expect(startMock).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith(
      'OpenTelemetry initialized with Honeycomb'
    )
  })

  it('falls back to the default service name when none is configured', async () => {
    process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY = 'test-key'
    delete process.env.NEXT_PUBLIC_SERVICE_NAME
    jest.spyOn(console, 'log').mockImplementation(() => {})

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()

    expect(HoneycombWebSDK).toHaveBeenCalledWith(
      expect.objectContaining({ serviceName: 'adulting-app' })
    )
  })

  it('does not initialize twice', async () => {
    process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY = 'test-key'
    jest.spyOn(console, 'log').mockImplementation(() => {})

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()
    initializeTelemetry()

    expect(HoneycombWebSDK).toHaveBeenCalledTimes(1)
  })

  it('logs an error when SDK construction throws', async () => {
    process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY = 'test-key'
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    HoneycombWebSDK.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to initialize OpenTelemetry:',
      expect.any(Error)
    )
  })

  it('shuts down and clears the SDK, and is safe to call when uninitialized', async () => {
    process.env.NEXT_PUBLIC_HONEYCOMB_API_KEY = 'test-key'
    jest.spyOn(console, 'log').mockImplementation(() => {})

    const { initializeTelemetry, shutdownTelemetry } =
      await import('../telemetry')

    // No-op when nothing has been initialized.
    await shutdownTelemetry()
    expect(shutdownMock).not.toHaveBeenCalled()

    initializeTelemetry()
    await shutdownTelemetry()
    expect(shutdownMock).toHaveBeenCalledTimes(1)

    // After shutdown the singleton is cleared, so re-init constructs anew.
    initializeTelemetry()
    expect(HoneycombWebSDK).toHaveBeenCalledTimes(2)
  })
})
