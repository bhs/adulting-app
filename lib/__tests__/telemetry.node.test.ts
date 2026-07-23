/**
 * @jest-environment node
 */
import { describe, it, expect, jest } from '@jest/globals'

// In the Node environment there is no `window`, exercising the server-side
// (SSR) early-return guard in initializeTelemetry.
const HoneycombWebSDK = jest.fn()
jest.mock('@honeycombio/opentelemetry-web', () => ({ HoneycombWebSDK }))

describe('telemetry (server environment)', () => {
  it('skips initialization when window is undefined', async () => {
    expect(typeof window).toBe('undefined')

    const { initializeTelemetry } = await import('../telemetry')
    initializeTelemetry()

    expect(HoneycombWebSDK).not.toHaveBeenCalled()
  })
})
