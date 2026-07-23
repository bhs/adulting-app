/**
 * Tests for analytics functions
 * Note: These are example tests showing the testing approach
 * Run with: npm test (after setting up Jest or another test framework)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock OpenTelemetry API
const mockSpan = {
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
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

describe('Analytics Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('trackBudgetCreated', () => {
    it('should create a span with budget attributes', async () => {
      const { trackBudgetCreated } = await import('../analytics')

      trackBudgetCreated({
        budgetId: 'budget-123',
        userId: 'user-456',
        amount: 500,
        currency: 'USD',
        category: 'groceries',
      })

      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'budget.created',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'budget_created',
            'budget.id': 'budget-123',
            'user.id': 'user-456',
            'budget.amount': 500,
            'budget.currency': 'USD',
            'budget.category': 'groceries',
          }),
        })
      )
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 1 }) // OK
      expect(mockSpan.end).toHaveBeenCalled()
    })

    it('should handle optional attributes', async () => {
      const { trackBudgetCreated } = await import('../analytics')

      trackBudgetCreated({
        budgetId: 'budget-123',
      })

      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'budget.created',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'budget_created',
            'budget.id': 'budget-123',
          }),
        })
      )
    })
  })

  describe('trackSessionStart', () => {
    it('should create a session start span', async () => {
      const { trackSessionStart } = await import('../analytics')

      trackSessionStart({ userId: 'user-123', sessionId: 'session-abc' })

      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'session.start',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'session_start',
            'session.id': 'session-abc',
            'user.id': 'user-123',
          }),
        })
      )
    })
  })

  describe('trackSessionEnd', () => {
    it('should create a session end span with duration', async () => {
      const { trackSessionEnd } = await import('../analytics')

      trackSessionEnd({
        userId: 'user-123',
        sessionId: 'session-abc',
        durationMs: 300000,
      })

      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'session.end',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'session_end',
            'session.id': 'session-abc',
            'user.id': 'user-123',
            'session.duration_ms': 300000,
          }),
        })
      )
    })
  })

  describe('SessionManager', () => {
    beforeEach(() => {
      // Reset SessionManager state
      const { SessionManager } = require('../analytics')
      SessionManager.endSession()
    })

    it('should start a session and return session ID', async () => {
      const { SessionManager } = await import('../analytics')

      const sessionId = SessionManager.startSession('user-123')

      expect(sessionId).toBeTruthy()
      expect(typeof sessionId).toBe('string')
      expect(SessionManager.getSessionId()).toBe(sessionId)
    })

    it('should track session duration', async () => {
      const { SessionManager } = await import('../analytics')

      SessionManager.startSession('user-123')

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100))

      const duration = SessionManager.getSessionDuration()
      expect(duration).toBeGreaterThan(0)
      expect(duration).toBeLessThan(1000) // Should be less than 1 second
    })

    it('should end session and clear state', async () => {
      const { SessionManager } = await import('../analytics')

      SessionManager.startSession('user-123')
      SessionManager.endSession('user-123')

      expect(SessionManager.getSessionId()).toBeNull()
      expect(SessionManager.getSessionDuration()).toBeNull()
    })
  })

  describe('generateSessionId', () => {
    it('uses crypto.randomUUID when available', async () => {
      const originalCrypto = window.crypto
      Object.defineProperty(window, 'crypto', {
        value: { randomUUID: () => 'uuid-from-crypto' },
        configurable: true,
      })

      try {
        const { SessionManager } = await import('../analytics')
        const sessionId = SessionManager.startSession()
        expect(sessionId).toBe('uuid-from-crypto')
        SessionManager.endSession()
      } finally {
        Object.defineProperty(window, 'crypto', {
          value: originalCrypto,
          configurable: true,
        })
      }
    })

    it('falls back to a timestamp-based id when crypto.randomUUID is unavailable', async () => {
      const originalCrypto = window.crypto
      // Simulate an environment without the Web Crypto randomUUID helper.
      Object.defineProperty(window, 'crypto', {
        value: undefined,
        configurable: true,
      })

      try {
        const { SessionManager } = await import('../analytics')
        const sessionId = SessionManager.startSession()
        expect(sessionId).toMatch(/^session-\d+-[a-z0-9]+$/)
        SessionManager.endSession()
      } finally {
        Object.defineProperty(window, 'crypto', {
          value: originalCrypto,
          configurable: true,
        })
      }
    })
  })

  describe('SessionManager edge cases', () => {
    it('endSession is a no-op when no session is active', async () => {
      const { SessionManager } = await import('../analytics')
      SessionManager.endSession()
      // No session start span should have been created.
      expect(SessionManager.getSessionId()).toBeNull()
    })

    it('getSessionDuration returns null when no session is active', async () => {
      const { SessionManager } = await import('../analytics')
      SessionManager.endSession()
      expect(SessionManager.getSessionDuration()).toBeNull()
    })

    it('trackSessionEnd handles being called with no attributes', async () => {
      const { trackSessionEnd } = await import('../analytics')
      trackSessionEnd()
      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'session.end',
        expect.objectContaining({
          attributes: expect.objectContaining({ 'event.name': 'session_end' }),
        })
      )
    })

    it('trackSessionStart generates a session id when none is provided', async () => {
      const { trackSessionStart } = await import('../analytics')
      trackSessionStart()
      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'session.start',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'session_start',
            'session.id': expect.any(String),
          }),
        })
      )
    })
  })

  describe('trackCustomEvent', () => {
    it('should create a span with custom attributes', async () => {
      const { trackCustomEvent } = await import('../analytics')

      trackCustomEvent('button_clicked', {
        button_name: 'save',
        page: 'settings',
        count: 1,
      })

      expect(mockTracer.startSpan).toHaveBeenCalledWith(
        'button_clicked',
        expect.objectContaining({
          attributes: expect.objectContaining({
            'event.name': 'button_clicked',
            button_name: 'save',
            page: 'settings',
            count: 1,
          }),
        })
      )
    })
  })
})
