# Error Tracking & Analytics Integration Guide

This document provides comprehensive guidance on the Sentry and Plausible Analytics integration for error tracking and session metrics.

## Overview

- **Sentry**: JavaScript error tracking and performance monitoring
- **Plausible Analytics**: Privacy-friendly, GDPR-compliant web analytics
- **Target KRs**:
  - Error Rate: <1%
  - Average Session Duration: ≥5 minutes

## Table of Contents

- [Sentry Integration](#sentry-integration)
- [Plausible Analytics Integration](#plausible-analytics-integration)
- [Dashboard Monitoring](#dashboard-monitoring)
- [Custom Event Tracking](#custom-event-tracking)
- [Privacy & Compliance](#privacy--compliance)
- [Troubleshooting](#troubleshooting)

## Sentry Integration

### Setup

1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Sign up for a free account (up to 5,000 errors/month)
   - Create a new Next.js project

2. **Get Your DSN**
   - Navigate to Settings → Projects → [Your Project] → Client Keys (DSN)
   - Copy the DSN URL

3. **Configure Environment Variables**
   ```bash
   # Add to .env or .env.local
   NEXT_PUBLIC_SENTRY_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"
   SENTRY_ORG="your-organization-slug"
   SENTRY_PROJECT="your-project-name"

   # Optional: For source map uploads (get from Settings → Auth Tokens)
   SENTRY_AUTH_TOKEN="your-auth-token"
   ```

4. **Install Dependencies**
   ```bash
   npm install @sentry/nextjs
   ```

### Configuration Files

The integration includes three Sentry configuration files:

- **`sentry.client.config.ts`**: Browser-side error tracking
  - Captures client-side errors and unhandled promises
  - Includes Session Replay (10% of sessions)
  - PII scrubbing via `beforeSend` hook

- **`sentry.server.config.ts`**: Server-side error tracking
  - Captures API route errors
  - Server-side exception tracking

- **`sentry.edge.config.ts`**: Edge runtime error tracking
  - For middleware and edge functions

### Features Enabled

1. **Error Tracking**
   - Automatic capture of unhandled exceptions
   - React error boundaries
   - Stack traces with source maps

2. **Performance Monitoring**
   - `tracesSampleRate: 0.1` (10% of transactions)
   - Automatic instrumentation of API routes
   - Database query tracking (via integrations)

3. **Session Replay**
   - `replaysOnErrorSampleRate: 1.0` (100% of error sessions)
   - `replaysSessionSampleRate: 0.1` (10% of regular sessions)
   - Text and media masking for privacy

4. **PII Scrubbing**
   - Redacts sensitive URL parameters (token, password, key, secret)
   - Removes sensitive headers (authorization, cookie, x-api-key)
   - Scrubs email addresses from breadcrumbs

### Error Boundary

The app includes a global error boundary at `app/error.tsx`:

```typescript
// Automatically catches and reports React component errors
// Displays user-friendly error message
// Includes "Try again" recovery button
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/nextjs'

// Capture an exception
try {
  riskyOperation()
} catch (error) {
  Sentry.captureException(error)
}

// Capture a message
Sentry.captureMessage('Something important happened', 'info')

// Add context with breadcrumbs
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked button',
  level: 'info',
  data: { buttonId: 'submit' }
})

// Set user context
Sentry.setUser({
  id: 'user-id',
  email: 'user@example.com',
  username: 'username'
})

// Add custom tags
Sentry.setTag('page', 'checkout')
Sentry.setTag('feature', 'payment')
```

## Plausible Analytics Integration

### Setup Options

#### Option 1: Plausible Cloud (Recommended)

1. Sign up at [plausible.io](https://plausible.io)
2. Start 30-day free trial
3. Add your website domain
4. Configure environment variables:
   ```bash
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN="your-domain.com"
   NEXT_PUBLIC_PLAUSIBLE_API_HOST="https://plausible.io"
   ```

#### Option 2: Self-Hosted

1. Follow [Plausible self-hosting guide](https://plausible.io/docs/self-hosting)
2. Deploy using Docker Compose
3. Configure environment variables:
   ```bash
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN="your-domain.com"
   NEXT_PUBLIC_PLAUSIBLE_API_HOST="https://your-plausible-server.com"
   ```

### Installation

```bash
npm install plausible-tracker
```

### Features Enabled

1. **Automatic Pageview Tracking**
   - Tracks all page navigations
   - Includes referrer and UTM parameters
   - Single-page app (SPA) support

2. **Custom Event Tracking**
   - Budget creation events
   - User action tracking
   - Session duration monitoring

3. **Session Tracking**
   - Automatic session start/stop
   - 5-minute interval heartbeat
   - Total session duration reporting

### Custom Events

Pre-configured custom events in `lib/analytics.ts`:

```typescript
// Budget created
trackCustomEvent({
  name: 'budget_created',
  props: { amount: 100, category: 'groceries' }
})

// Session active (auto-tracked every 5 minutes)
trackCustomEvent({
  name: 'session_active',
  props: { duration: 300 }
})

// API call tracking
trackCustomEvent({
  name: 'api_call',
  props: { endpoint: '/api/users', status: 200 }
})

// Generic user actions
trackCustomEvent({
  name: 'user_action',
  props: { action: 'click', component: 'nav-button' }
})
```

## Dashboard Monitoring

### Sentry Dashboard

**URL**: `https://sentry.io/organizations/[org]/issues/`

#### Daily Checks

1. **Issues Overview**
   - Total errors in last 24 hours
   - New vs. regression errors
   - Critical unhandled errors

2. **Performance Tab**
   - Average response times
   - Slow transactions (>1s)
   - Database query performance

3. **Releases**
   - Error rates per deployment
   - New errors introduced
   - Resolved issues

#### Weekly Review

- [ ] Error-free sessions percentage (target: >99%)
- [ ] Most frequent error types
- [ ] Users affected by errors
- [ ] Geographic distribution of errors
- [ ] Browser/device error patterns

#### Alert Configuration

Set up email/Slack alerts for:
- More than 5 errors in 1 hour
- Error rate increases >50%
- New error types appear
- Performance degradation (p95 >2s)

### Plausible Dashboard

**URL**: `https://plausible.io/[your-domain]`

#### Key Metrics

1. **Visitors**
   - Unique visitors (daily/weekly/monthly)
   - Page views
   - Views per visit

2. **Engagement**
   - Time on page (target: ≥5 minutes)
   - Bounce rate (target: <70%)
   - Pages per session

3. **Custom Goals**
   - `budget_created` conversions
   - `session_active` duration
   - `user_action` frequency

#### Daily Checks

- [ ] Unique visitors trend
- [ ] Average session duration (target: ≥5 min)
- [ ] Top pages by traffic
- [ ] Bounce rate by page
- [ ] Custom event conversions

#### Weekly Review

- [ ] Traffic sources (direct, referral, social)
- [ ] Entry pages performance
- [ ] Exit pages analysis
- [ ] Device & browser breakdown
- [ ] Geographic distribution

### Setting Up Goals in Plausible

1. Go to Site Settings → Goals
2. Click "+ Add Goal"
3. Choose "Custom Event"
4. Add event names:
   - `budget_created`
   - `session_active`
   - `user_action`
   - `api_call`

## Custom Event Tracking

### Adding New Events

1. **Define Event Type** in `lib/analytics.ts`:
   ```typescript
   export type CustomEvent =
     | { name: 'new_event'; props: { key: string } }
     // ... existing events
   ```

2. **Track the Event**:
   ```typescript
   import { trackCustomEvent } from '@/lib/analytics'

   trackCustomEvent({
     name: 'new_event',
     props: { key: 'value' }
   })
   ```

3. **Register in Plausible Dashboard**:
   - Go to Site Settings → Goals
   - Add "new_event" as custom event

### Best Practices

- Use descriptive event names (lowercase with underscores)
- Keep property keys consistent
- Don't track PII in event properties
- Limit to 5-10 core events
- Document events in code comments

## Privacy & Compliance

### GDPR Compliance

**Plausible**:
- No cookies used
- No personal data collected
- IP addresses anonymized
- GDPR compliant by default
- No consent banner required

**Sentry**:
- User consent recommended for Session Replay
- PII scrubbing enabled via `beforeSend`
- IP anonymization available
- Data retention: 90 days (configurable)

### Data Scrubbing

Sentry automatically scrubs:
- Credit card numbers
- Social security numbers
- Passwords and tokens
- Email addresses (in breadcrumbs)
- Custom sensitive patterns (configurable)

### User Privacy Settings

To disable tracking for specific users:

```typescript
// Disable Plausible for user
if (userOptedOut) {
  window.plausible = () => {}
}

// Don't send to Sentry
Sentry.init({
  beforeSend(event) {
    if (userOptedOut) return null
    return event
  }
})
```

## Troubleshooting

### Sentry Not Receiving Events

1. **Check DSN Configuration**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify Initialization**
   - Check browser console for Sentry initialization
   - Look for "Sentry Logger" messages (if debug: true)

3. **Test Error Capture**
   ```typescript
   Sentry.captureMessage('Test message')
   ```

4. **Check Browser Network Tab**
   - Look for requests to `sentry.io/api/*/envelope/`
   - Check for CORS errors

### Plausible Not Tracking

1. **Verify Environment Variables**
   ```bash
   echo $NEXT_PUBLIC_PLAUSIBLE_DOMAIN
   echo $NEXT_PUBLIC_PLAUSIBLE_API_HOST
   ```

2. **Check Browser Console**
   - No errors about plausible-tracker
   - Script loaded successfully

3. **Test Event Tracking**
   ```typescript
   import { trackEvent } from '@/lib/analytics'
   trackEvent('test_event')
   ```

4. **Check Network Tab**
   - Look for POST requests to Plausible API
   - Verify response status 202

### Common Issues

**Issue**: Source maps not uploading to Sentry
- **Solution**: Set `SENTRY_AUTH_TOKEN` in environment variables

**Issue**: Plausible shows no data
- **Solution**: Ensure domain in env matches domain in Plausible dashboard exactly

**Issue**: Too many Sentry events
- **Solution**: Reduce `tracesSampleRate` or add more items to `ignoreErrors`

**Issue**: Session duration always 0
- **Solution**: Check that `startSessionTracking()` is called in app layout

## Cost Optimization

### Sentry Free Tier Limits
- 5,000 errors per month
- 10,000 performance units per month
- 50 replay sessions per month

**To Stay Within Limits**:
- Set `tracesSampleRate: 0.1` (10%)
- Set `replaysSessionSampleRate: 0.1` (10%)
- Add common noise to `ignoreErrors`
- Filter out development errors

### Plausible Pricing
- Free for self-hosted
- Cloud: $9/month for up to 10k monthly pageviews
- $19/month for up to 100k pageviews

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Plausible API Docs](https://plausible.io/docs)
- [Plausible Events API](https://plausible.io/docs/events-api)
- [GDPR Compliance Guide](https://plausible.io/data-policy)
