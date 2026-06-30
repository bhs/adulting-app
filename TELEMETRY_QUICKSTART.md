# Telemetry Quick Start

Quick reference for using Honeycomb OpenTelemetry integration in this project.

## Setup (5 minutes)

1. Get API key from https://ui.honeycomb.io/account
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_HONEYCOMB_API_KEY="your-key-here"
   ```
3. Restart dev server: `npm run dev`

## Usage Examples

### Track Custom Events

```typescript
import { trackBudgetCreated, trackCustomEvent } from '@/lib/analytics';

// Budget creation
trackBudgetCreated({
  budgetId: 'budget-123',
  userId: 'user-456',
  amount: 500,
  currency: 'USD',
  category: 'groceries',
});

// Custom event
trackCustomEvent('button_clicked', {
  button_name: 'save',
  page: 'settings',
});
```

### Session Management

```typescript
import { SessionManager } from '@/lib/analytics';

// Sessions auto-start on page load, but you can manage manually:
const sessionId = SessionManager.startSession('user-123');
const duration = SessionManager.getSessionDuration(); // milliseconds
SessionManager.endSession('user-123');
```

### Error Tracking

Errors are automatically captured by ErrorBoundary. For manual error tracking:

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('my-feature');
const span = tracer.startSpan('operation_name');

try {
  // Your code
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
} finally {
  span.end();
}
```

## Key Honeycomb Queries

### Error Rate
```
WHERE exception.type EXISTS
CALCULATE COUNT
---
Total events: COUNT(*)
Error rate: (errors / total) * 100
```
**Target**: <1%

### P50 Session Duration
```
WHERE event.name = session_end
CALCULATE P50(session.duration_ms)
```
**Target**: ≥300,000ms (5 minutes)

### Budget Creation Trend
```
WHERE event.name = budget_created
CALCULATE COUNT
GROUP BY budget.category
```

## Troubleshooting

### No data in Honeycomb?
1. Check console: Should see "OpenTelemetry initialized with Honeycomb"
2. Check Network tab: POST requests to `api.honeycomb.io/v1/traces`
3. Wait 30-60 seconds for data to appear

### API key error?
- Ensure `NEXT_PUBLIC_` prefix is used
- Check key is correct at https://ui.honeycomb.io/account
- Restart dev server after adding .env variables

### Errors not captured?
- ErrorBoundary only catches React render errors
- For async errors, use manual span tracking (see above)
- Check ErrorBoundary wraps your app in `app/layout.tsx`

## What's Automatically Tracked

✅ Session start/end with duration
✅ React render errors with stack traces
✅ Page unload (session end)

## What You Need to Track Manually

📝 Budget creation events
📝 User interactions (clicks, form submissions)
📝 Feature usage
📝 API errors (in try/catch blocks)

## Full Documentation

See [HONEYCOMB_SETUP.md](./HONEYCOMB_SETUP.md) for complete guide including:
- Deployment configuration
- Advanced query examples
- Performance considerations
- Security notes
