/**
 * Custom event analytics using OpenTelemetry spans
 * All events use standard OTel semantic conventions for vendor portability
 */

import { trace, SpanStatusCode, Attributes } from '@opentelemetry/api';

const tracer = trace.getTracer('analytics');

/**
 * Track when a user session starts
 * Records session_start event with user and session context
 */
export function trackSessionStart(attributes?: {
  userId?: string;
  sessionId?: string;
}) {
  const span = tracer.startSpan('session.start', {
    attributes: {
      'event.name': 'session_start',
      'session.id': attributes?.sessionId || generateSessionId(),
      ...(attributes?.userId && { 'user.id': attributes.userId }),
    },
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Track when a user session ends
 * Records session_end event with duration and outcome
 */
export function trackSessionEnd(attributes?: {
  userId?: string;
  sessionId?: string;
  durationMs?: number;
}) {
  const span = tracer.startSpan('session.end', {
    attributes: {
      'event.name': 'session_end',
      ...(attributes?.sessionId && { 'session.id': attributes.sessionId }),
      ...(attributes?.userId && { 'user.id': attributes.userId }),
      ...(attributes?.durationMs && {
        'session.duration_ms': attributes.durationMs,
      }),
    },
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Track when a budget is created
 * Records budget_created event with budget metadata
 */
export function trackBudgetCreated(attributes: {
  budgetId: string;
  userId?: string;
  amount?: number;
  currency?: string;
  category?: string;
}) {
  const spanAttributes: Attributes = {
    'event.name': 'budget_created',
    'budget.id': attributes.budgetId,
  };

  if (attributes.userId) spanAttributes['user.id'] = attributes.userId;
  if (attributes.amount) spanAttributes['budget.amount'] = attributes.amount;
  if (attributes.currency)
    spanAttributes['budget.currency'] = attributes.currency;
  if (attributes.category)
    spanAttributes['budget.category'] = attributes.category;

  const span = tracer.startSpan('budget.created', {
    attributes: spanAttributes,
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Track when a budget preset is loaded
 * Records preset_loaded event with preset details
 */
export function trackBudgetPresetLoaded(attributes: {
  presetId: string;
  presetName: string;
  userId?: string;
}) {
  const spanAttributes: Attributes = {
    'event.name': 'budget_preset_loaded',
    'preset.id': attributes.presetId,
    'preset.name': attributes.presetName,
  };

  if (attributes.userId) spanAttributes['user.id'] = attributes.userId;

  const span = tracer.startSpan('budget.preset.loaded', {
    attributes: spanAttributes,
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Track budget dashboard interactions
 * Records various user interactions with the budget dashboard
 */
export function trackBudgetDashboardEvent(
  eventType: 'item_added' | 'item_removed' | 'calculation_updated',
  attributes?: {
    category?: string;
    totalIncome?: number;
    totalExpenses?: number;
    netCashFlow?: number;
    savingsRate?: number;
  }
) {
  const spanAttributes: Attributes = {
    'event.name': `budget_dashboard_${eventType}`,
    'dashboard.event_type': eventType,
  };

  if (attributes?.category) spanAttributes['budget.category'] = attributes.category;
  if (attributes?.totalIncome !== undefined)
    spanAttributes['budget.total_income'] = attributes.totalIncome;
  if (attributes?.totalExpenses !== undefined)
    spanAttributes['budget.total_expenses'] = attributes.totalExpenses;
  if (attributes?.netCashFlow !== undefined)
    spanAttributes['budget.net_cash_flow'] = attributes.netCashFlow;
  if (attributes?.savingsRate !== undefined)
    spanAttributes['budget.savings_rate'] = attributes.savingsRate;

  const span = tracer.startSpan(`budget.dashboard.${eventType}`, {
    attributes: spanAttributes,
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Track a custom event with arbitrary attributes
 * Useful for tracking additional user interactions
 */
export function trackCustomEvent(
  eventName: string,
  attributes?: Record<string, string | number | boolean>
) {
  const spanAttributes: Attributes = {
    'event.name': eventName,
    ...attributes,
  };

  const span = tracer.startSpan(eventName, {
    attributes: spanAttributes,
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

/**
 * Generate a unique session ID
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID
 */
function generateSessionId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static sessionId: string | null = null;
  private static sessionStartTime: number | null = null;

  /**
   * Start tracking a session
   * Automatically records session_start event
   */
  static startSession(userId?: string): string {
    this.sessionId = generateSessionId();
    this.sessionStartTime = Date.now();

    trackSessionStart({ sessionId: this.sessionId, userId });

    return this.sessionId;
  }

  /**
   * End the current session
   * Automatically records session_end event with duration
   */
  static endSession(userId?: string): void {
    if (!this.sessionId || !this.sessionStartTime) {
      return;
    }

    const durationMs = Date.now() - this.sessionStartTime;

    trackSessionEnd({
      sessionId: this.sessionId,
      userId,
      durationMs,
    });

    this.sessionId = null;
    this.sessionStartTime = null;
  }

  /**
   * Get the current session ID
   */
  static getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get the session duration in milliseconds
   */
  static getSessionDuration(): number | null {
    if (!this.sessionStartTime) {
      return null;
    }
    return Date.now() - this.sessionStartTime;
  }
}
