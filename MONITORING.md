# Monitoring and Analytics Guide

This guide provides detailed information about error tracking and analytics integration in this project.

## Table of Contents

- [Sentry Error Tracking](#sentry-error-tracking)
- [Plausible Analytics](#plausible-analytics)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Validation and Testing](#validation-and-testing)

## Sentry Error Tracking

### Overview

Sentry provides comprehensive error tracking and performance monitoring with:
- Real-time error reporting with full stack traces
- Source map support for debugging minified production code
- Performance monitoring and transaction tracing
- Release tracking and issue assignment
- Custom context and breadcrumbs

### Configuration

The project includes three Sentry configuration files:
- `sentry.client.config.ts` - Client-side (browser) configuration
- `sentry.server.config.ts` - Server-side (Node.js) configuration
- `sentry.edge.config.ts` - Edge runtime configuration

Environment variables control the behavior:
```bash
# Required
SENTRY_DSN="https://key@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://key@sentry.io/project"

# Optional (for source map uploads)
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-token"
```

### Automatic Error Capture

The following errors are captured automatically:
- Unhandled exceptions in API routes
- React component errors (via ErrorBoundary)
- Unhandled promise rejections
- Network errors (in production only)

### Manual Error Capture

Use the helper functions from `lib/sentry.ts`:

```typescript
import { captureException, addBreadcrumb, setUser } from '@/lib/sentry'

// Basic error capture
try {
  await dangerousOperation()
} catch (error) {
  captureException(error)
}

// Error with context
captureException(error, {
  userId: user.id,
  operation: 'checkout',
  paymentMethod: 'stripe',
})

// Set user context (persists across errors)
setUser({
  id: user.id,
  email: user.email,
  name: user.name,
})

// Add breadcrumbs for debugging
addBreadcrumb({
  message: 'User initiated checkout',
  category: 'user-action',
  level: 'info',
  data: { cartTotal: 99.99 },
})
```

### Alert Configuration

Recommended Sentry alerts to set up:

1. **High Error Rate Alert**
   - Condition: Error rate > 1% of total requests
   - Action: Email team, create Slack notification
   - Purpose: Catch widespread issues immediately

2. **New Issue Alert**
   - Condition: First occurrence of a new error in production
   - Action: Email on-call developer
   - Purpose: Be notified of new bugs as they appear

3. **Performance Degradation Alert**
   - Condition: P95 response time > 1000ms
   - Action: Create issue in project tracker
   - Purpose: Monitor performance regressions

4. **Critical Error Alert**
   - Condition: Specific error patterns (database failures, auth errors)
   - Action: Page on-call engineer
   - Purpose: Immediate response to critical failures

### Interpreting Metrics

Key Sentry metrics to monitor:

- **Error Rate**: Target < 0.1% of requests
- **Unhandled Errors**: Should be 0 for well-tested code
- **Performance (APDEX)**: Target > 0.95
- **User Impact**: Number of unique users affected by errors

## Plausible Analytics

### Overview

Plausible Analytics is a privacy-friendly, lightweight analytics tool that provides:
- Real-time visitor statistics
- No cookies or personal data collection
- GDPR/CCPA compliant by default
- Custom event tracking
- Small script size (<1KB)

### Configuration

Environment variables:
```bash
# Required
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"

# Optional (for self-hosted)
NEXT_PUBLIC_PLAUSIBLE_HOST="https://plausible.io"
```

The script is automatically loaded in `app/layout.tsx` and will only load if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set.

### Automatic Tracking

Plausible automatically tracks:
- Page views
- Unique visitors
- Bounce rate
- Visit duration
- Referrer sources
- Device type (desktop/mobile)
- Browser and OS

### Custom Event Tracking

Use the helper functions from `lib/analytics.ts`:

```typescript
import {
  trackEvent,
  trackModuleCompletion,
  trackSessionMilestone,
  trackButtonClick,
} from '@/lib/analytics'

// Track module completion
trackModuleCompletion('onboarding-tutorial', 180) // 180 seconds

// Track milestones
trackSessionMilestone('first-login')
trackSessionMilestone('profile-completed')

// Track button interactions
trackButtonClick('sign-up-button', 'hero-section')

// Custom events
trackEvent('feature-toggle', {
  feature: 'dark-mode',
  enabled: true,
})
```

### Goals and Conversions

Set up goals in your Plausible dashboard:

1. **Signup Goal**: Track "Signup" custom event
2. **Module Completion Goal**: Track "Module Completed" custom event
3. **Page-based Goals**: Track visits to `/dashboard` or `/success`

### Key Metrics

Important Plausible metrics to review:

- **Unique Visitors**: Daily/weekly active users
- **Pageviews**: Total pages viewed
- **Bounce Rate**: Target < 60%
- **Visit Duration**: Target > 2 minutes for web apps
- **Goal Conversion Rate**: Varies by goal (track trends)

## Implementation Examples

### Example 1: Form Submission with Error Tracking

```typescript
'use client'

import { useState } from 'react'
import { captureException } from '@/lib/sentry'
import { trackFormSubmission } from '@/lib/analytics'

export function ContactForm() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      if (!response.ok) throw new Error('Failed to submit form')

      trackFormSubmission('contact-form', true)
      alert('Form submitted successfully!')
    } catch (error) {
      captureException(error, {
        form: 'contact-form',
        fields: ['name', 'email', 'message'],
      })
      trackFormSubmission('contact-form', false)
      alert('Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### Example 2: Protected Route with User Context

```typescript
import { redirect } from 'next/navigation'
import { setUser } from '@/lib/sentry'
import { getCurrentUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Set user context for error tracking
  setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  })

  return <DashboardContent user={user} />
}
```

### Example 3: API Route with Full Monitoring

```typescript
import { NextResponse } from 'next/server'
import { captureException, addBreadcrumb } from '@/lib/sentry'

export async function POST(request: Request) {
  try {
    addBreadcrumb({
      message: 'Processing payment request',
      category: 'api',
      level: 'info',
    })

    const body = await request.json()
    const { amount, currency } = body

    addBreadcrumb({
      message: 'Payment details received',
      category: 'payment',
      data: { amount, currency },
    })

    // Process payment
    const result = await processPayment({ amount, currency })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    captureException(error, {
      endpoint: '/api/payment',
      method: 'POST',
      severity: 'critical',
    })

    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
```

## Best Practices

### Error Tracking

1. **Add Context**: Always include relevant context with errors
2. **Use Breadcrumbs**: Add breadcrumbs before risky operations
3. **Set User Context**: Identify users to track affected individuals
4. **Filter Sensitive Data**: Never log passwords, tokens, or PII
5. **Use Severity Levels**: Categorize errors (info, warning, error, fatal)
6. **Tag Errors**: Use tags for easier filtering and grouping

### Analytics

1. **Define Goals Early**: Know what user actions you want to track
2. **Be Selective**: Don't track everything, focus on key metrics
3. **Use Consistent Naming**: Establish naming conventions for events
4. **Include Context**: Add relevant properties to custom events
5. **Test Events**: Verify events are firing in development
6. **Review Regularly**: Check analytics weekly to spot trends

### Privacy

1. **No PII in Analytics**: Never send personal data to Plausible
2. **Scrub Sensitive Context**: Use Sentry's beforeSend hook
3. **Document Data Collection**: Be transparent about what you track
4. **Respect DNT**: Consider honoring Do Not Track headers
5. **Minimal Retention**: Set appropriate data retention policies

## Validation and Testing

### Validating Sentry Integration

1. **Test Error Capture**:
```typescript
// Add this to a page temporarily
if (typeof window !== 'undefined') {
  throw new Error('Test error - please ignore')
}
```

2. **Check Sentry Dashboard**:
   - Navigate to your Sentry project
   - Look for the test error in Issues
   - Verify stack trace shows correct file/line numbers
   - Confirm environment is set correctly (development/production)

3. **Verify Source Maps** (production only):
   - Deploy with source maps enabled
   - Trigger an error in production
   - Check that stack traces show original TypeScript code, not minified

4. **Test Breadcrumbs**:
   - Trigger an error after adding breadcrumbs
   - Check the error in Sentry includes breadcrumb trail

### Validating Plausible Integration

1. **Test Pageview Tracking**:
   - Open your site in a browser
   - Open Plausible dashboard
   - Verify real-time visitor appears within 30 seconds

2. **Test Custom Events**:
```typescript
// Add to a button click
trackEvent('test-event', { source: 'validation' })
```
   - Trigger the event
   - Check Plausible dashboard under "Goal Conversions"
   - Verify event appears with correct properties

3. **Check Network Requests**:
   - Open browser DevTools → Network tab
   - Look for requests to `plausible.io/api/event`
   - Verify requests return 202 status

### Monitoring Health Checks

Weekly review checklist:

- [ ] Sentry error rate < 0.1%
- [ ] No critical errors unaddressed
- [ ] All alerts functioning
- [ ] Source maps uploading correctly
- [ ] Plausible tracking all pages
- [ ] Custom events firing correctly
- [ ] Goal conversion rates reasonable
- [ ] No unusual traffic patterns

### Key Performance Indicators (KRIs)

**Sentry KRIs**:
- Error rate threshold: < 1% of total requests
- Time to resolution: < 24 hours for critical errors
- User impact: < 1% of users affected by errors

**Plausible KRIs**:
- Session duration: Average > 2 minutes
- Bounce rate: < 60%
- Module completion rate: > 70% (if applicable)
- Goal conversion rates: Track trends over time

## Troubleshooting

### Sentry Issues

**Problem**: Errors not appearing in Sentry
- Check `SENTRY_DSN` is set correctly
- Verify no ad blockers are blocking Sentry
- Check browser console for Sentry initialization errors
- Ensure Sentry is initialized before errors occur

**Problem**: Source maps not working
- Verify `SENTRY_AUTH_TOKEN` is set
- Check build logs for source map upload confirmation
- Ensure `productionBrowserSourceMaps: true` in next.config.js

### Plausible Issues

**Problem**: No pageviews showing
- Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matches your domain exactly
- Verify script is loading (check Network tab)
- Ensure no ad blockers are enabled
- Check Plausible settings allow tracking from localhost (in dev)

**Problem**: Custom events not tracking
- Verify `window.plausible` is defined before calling
- Check event names match goals in Plausible dashboard
- Ensure script has loaded before firing events
- Look for console errors

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Plausible Analytics Documentation](https://plausible.io/docs)
- [Sentry Error Tracking Best Practices](https://blog.sentry.io/tags/best-practices/)
- [Privacy-Friendly Analytics Guide](https://plausible.io/privacy-focused-web-analytics)
