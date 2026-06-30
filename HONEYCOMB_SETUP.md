# Honeycomb OpenTelemetry Setup Guide

This guide explains how to set up and use Honeycomb for error tracking and user analytics using OpenTelemetry.

## Overview

This application uses Honeycomb as a single OTel-native SaaS tool for:
- **Error Monitoring**: Automatic tracking of React errors via ErrorBoundary
- **User Analytics**: Custom event tracking (budget_created, session_start, session_end)
- **Performance Metrics**: Session duration and error rate monitoring

All instrumentation uses standard OpenTelemetry semantic conventions, making the code vendor-portable.

## Setup Instructions

### 1. Create a Honeycomb Account

1. Sign up for a free Honeycomb account at https://ui.honeycomb.io/signup
2. Free tier includes up to 20M events/month
3. Navigate to your Team Settings → Environments → API Keys
4. Create a new API key or copy the existing one

### 2. Configure Environment Variables

Add the following to your `.env.local` file (or deployment platform):

```bash
NEXT_PUBLIC_HONEYCOMB_API_KEY="your-honeycomb-api-key-here"
NEXT_PUBLIC_SERVICE_NAME="adulting-app"  # Optional, defaults to 'adulting-app'
```

**Important**: The `NEXT_PUBLIC_` prefix is required because these variables are used in client-side code.

### 3. Deploy Configuration

#### Vercel Deployment
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_HONEYCOMB_API_KEY` with your API key
4. Redeploy your application

#### Render.com Deployment
Update your `render.yaml` with environment variables:

```yaml
services:
  - type: web
    name: adulting-app
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_HONEYCOMB_API_KEY
        value: your-honeycomb-api-key-here
      - key: NEXT_PUBLIC_SERVICE_NAME
        value: adulting-app
```

Or add them via the Render dashboard:
1. Go to your service → Environment
2. Add the environment variables
3. Save and redeploy

## Architecture

### Components

1. **Telemetry Initialization** (`lib/telemetry.ts`)
   - Initializes Honeycomb Web SDK on client mount
   - Configures OTLP/HTTP endpoint
   - Sets up resource attributes for filtering

2. **Error Boundary** (`components/ErrorBoundary.tsx`)
   - Catches React render errors
   - Records error spans with stack traces
   - Uses standard OTel exception conventions

3. **Analytics Utilities** (`lib/analytics.ts`)
   - Session tracking (start/end with duration)
   - Custom event tracking (budget_created, etc.)
   - Vendor-portable span events with semantic conventions

4. **Client Layout** (`components/ClientLayout.tsx`)
   - Wraps app with ErrorBoundary
   - Initializes telemetry on mount
   - Manages session lifecycle

## Usage Examples

### Tracking Custom Events

```typescript
import { trackBudgetCreated, trackCustomEvent } from '@/lib/analytics';

// Track budget creation
trackBudgetCreated({
  budgetId: 'budget-123',
  userId: 'user-456',
  amount: 500,
  currency: 'USD',
  category: 'groceries',
});

// Track any custom event
trackCustomEvent('feature_used', {
  feature: 'dark_mode',
  enabled: true,
});
```

### Manual Session Management

```typescript
import { SessionManager } from '@/lib/analytics';

// Session tracking is automatic, but you can also manage manually
const sessionId = SessionManager.startSession('user-123');
console.log('Current session:', sessionId);

// Get session duration
const duration = SessionManager.getSessionDuration();
console.log('Session has been active for:', duration, 'ms');

// End session manually (otherwise ends on page unload)
SessionManager.endSession('user-123');
```

## Honeycomb Query Examples

### 1. Error Rate Calculation

**Objective**: Validate the <1% error rate KR

**Query Setup**:
1. Go to Honeycomb → New Query
2. Set the following:
   - **VISUALIZE**: COUNT
   - **WHERE**: `name = error.boundary.catch` (for errors only)
   - **Calculate**: Error rate

**BubbleUp Query** (easier):
```
WHERE exception.type EXISTS
CALCULATE COUNT
```

**Query for Error Rate**:
1. Create a derived column in Honeycomb:
   - Name: `is_error`
   - Condition: `name = error.boundary.catch OR exception.type EXISTS`
2. Create query:
   - **VISUALIZE**: COUNT where `is_error = true`
   - **Calculation**: `COUNT(is_error = true) / COUNT(*) * 100`
   - **Result**: Error rate as percentage

**Alternative (simpler)**:
- Query 1: Total events: `COUNT(*)`
- Query 2: Total errors: `COUNT(*) WHERE exception.type EXISTS`
- Calculate manually: `errors / total * 100`

**Save this query as**: "Error Rate Monitor"

**Acceptance Criteria**: Error rate should be <1%

### 2. Session Duration (P50)

**Objective**: Validate the ≥5 minute average session duration KR

**Query Setup**:
1. Go to Honeycomb → New Query
2. Set the following:
   - **VISUALIZE**: P50 of `session.duration_ms`
   - **WHERE**: `event.name = session_end`
   - **GROUP BY**: (none, or `user.id` for per-user analysis)

**Query**:
```
WHERE event.name = session_end
CALCULATE P50(session.duration_ms)
```

**Convert to minutes**: Result is in milliseconds, divide by 60000 for minutes

**Additional useful calculations**:
- P95 session duration: `P95(session.duration_ms)`
- Average session duration: `AVG(session.duration_ms)`
- Session count per user: `COUNT GROUP BY user.id`

**Save this query as**: "P50 Session Duration"

**Acceptance Criteria**: P50 session duration ≥300,000ms (5 minutes)

### 3. Budget Creation Events

**Query**:
```
WHERE event.name = budget_created
CALCULATE COUNT
GROUP BY budget.category
```

This shows how many budgets are created per category.

### 4. Error Details and Stack Traces

**Query**:
```
WHERE exception.type EXISTS
VISUALIZE COUNT
GROUP BY exception.type, exception.message
```

Click on any error to see full details including:
- Stack trace (`exception.stacktrace`)
- Component stack (`error.component.stack`)
- Timestamp and frequency

## Monitoring Dashboard Setup

### Recommended Board Setup

Create a Honeycomb board with the following queries:

1. **Error Rate (Heatmap)**
   - Query: Error rate over time
   - Visualization: Heatmap
   - Time range: Last 24 hours

2. **P50 Session Duration (Line Chart)**
   - Query: P50 session duration over time
   - Visualization: Line graph
   - Time range: Last 7 days

3. **Session Count (Bar Chart)**
   - Query: `WHERE event.name = session_start | COUNT`
   - Visualization: Bar chart
   - Time range: Last 24 hours

4. **Top Errors (Table)**
   - Query: Error breakdown by type
   - Visualization: Table
   - Shows most common errors

5. **Budget Creation Trend (Line Chart)**
   - Query: `WHERE event.name = budget_created | COUNT`
   - Visualization: Line graph
   - Time range: Last 30 days

## Semantic Conventions Used

This implementation follows OpenTelemetry semantic conventions:

### Error Spans
- `exception.type`: Error class name
- `exception.message`: Error message
- `exception.stacktrace`: Full stack trace
- `error.component.stack`: React component stack
- `error.boundary`: Boolean flag for boundary-caught errors

### Session Events
- `event.name`: Event type (session_start, session_end)
- `session.id`: Unique session identifier
- `session.duration_ms`: Session duration in milliseconds
- `user.id`: User identifier (optional)

### Budget Events
- `event.name`: "budget_created"
- `budget.id`: Unique budget identifier
- `budget.amount`: Budget amount
- `budget.currency`: Currency code (USD, EUR, etc.)
- `budget.category`: Budget category
- `user.id`: User who created the budget

## Troubleshooting

### Telemetry Not Sending

1. Check browser console for initialization messages:
   - Should see: "OpenTelemetry initialized with Honeycomb"
   - If warning appears: Check `NEXT_PUBLIC_HONEYCOMB_API_KEY` is set

2. Verify environment variables:
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_HONEYCOMB_API_KEY
   ```

3. Check browser Network tab:
   - Look for POST requests to `https://api.honeycomb.io/v1/traces`
   - If 401 Unauthorized: API key is invalid
   - If no requests: Telemetry not initialized

### No Data in Honeycomb

1. Wait 30-60 seconds for data to appear
2. Verify the service name in Honeycomb matches your configuration
3. Check that events are being generated (trigger errors or custom events)
4. Look in the "Recent Traces" view in Honeycomb

### Errors Not Being Captured

1. Verify ErrorBoundary is wrapping your app (check `app/layout.tsx`)
2. Ensure errors are being thrown in React components (not in event handlers)
3. For async errors, use `trackCustomEvent` to manually record them

### Session Duration Always Zero

Sessions may end too quickly if:
1. User navigates away immediately (use `SessionManager.getSessionDuration()` to debug)
2. Browser is blocking beforeunload events (test in different browser)
3. Session tracking not initialized (check console logs)

## Performance Considerations

### Client-Side Overhead

- OpenTelemetry SDK adds ~50KB gzipped
- Minimal runtime overhead (<1ms per event)
- Events batched automatically by SDK
- No impact on initial page load (lazy initialization)

### Rate Limits

Free tier: 20M events/month
- ~650K events/day
- ~27K events/hour
- Sufficient for most applications

If you approach limits:
- Reduce sampling rate
- Filter out noisy events
- Consider upgrading to paid tier

## Security Notes

1. **API Key Exposure**: `NEXT_PUBLIC_*` variables are exposed in client bundle
   - Honeycomb API keys can only write data, not read
   - Still recommended to use environment-specific keys
   - Rotate keys if compromised

2. **PII Data**: Avoid sending sensitive data in span attributes
   - Don't include passwords, tokens, or credit cards
   - Hash or redact email addresses if needed
   - Review Honeycomb's data retention policies

## Additional Resources

- [Honeycomb Documentation](https://docs.honeycomb.io/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [Honeycomb Web SDK](https://github.com/honeycombio/honeycomb-opentelemetry-web)
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)
