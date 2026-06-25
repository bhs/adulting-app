# Analytics & Error Tracking Quick Start

Quick reference for using Sentry and Plausible Analytics in this project.

## Sentry Error Tracking

### Import
```typescript
import { captureException, addBreadcrumb, setUser } from '@/lib/sentry'
```

### Common Use Cases

**Track errors:**
```typescript
try {
  await riskyOperation()
} catch (error) {
  captureException(error, { operation: 'riskyOperation', userId: user.id })
  throw error // Re-throw if needed
}
```

**Add debugging context:**
```typescript
addBreadcrumb({
  message: 'User clicked checkout',
  category: 'user-action',
  data: { cartTotal: 99.99 }
})
```

**Set user context:**
```typescript
setUser({ id: user.id, email: user.email, name: user.name })
```

**Clear user context (logout):**
```typescript
setUser(null)
```

## Plausible Analytics

### Import
```typescript
import {
  trackEvent,
  trackModuleCompletion,
  trackSessionMilestone,
  trackButtonClick,
} from '@/lib/analytics'
```

### Common Use Cases

**Track custom events:**
```typescript
trackEvent('feature-enabled', { feature: 'dark-mode', enabled: true })
```

**Track module completion:**
```typescript
trackModuleCompletion('Getting Started', 120) // 120 seconds
```

**Track milestones:**
```typescript
trackSessionMilestone('first-login')
trackSessionMilestone('profile-completed', 100) // optional value
```

**Track button clicks:**
```typescript
trackButtonClick('signup-cta', 'hero-section')
```

## Setup Checklist

- [ ] Sign up for Sentry at [sentry.io](https://sentry.io)
- [ ] Create a new Next.js project in Sentry
- [ ] Copy DSN to `.env`: `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Sign up for Plausible at [plausible.io](https://plausible.io) or self-host
- [ ] Add domain to Plausible dashboard
- [ ] Copy domain to `.env`: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] Deploy and verify both services are working

## Validation

**Test Sentry:**
```typescript
// Temporary test - remove after verification
throw new Error('Test Sentry integration')
```

**Test Plausible:**
1. Visit your site
2. Check Plausible dashboard for real-time visitor
3. Test custom event: `trackEvent('test', { working: true })`

## Environment Variables

```bash
# Sentry (Required)
SENTRY_DSN="https://key@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://key@sentry.io/project"

# Sentry Source Maps (Optional)
SENTRY_AUTH_TOKEN="your-token"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"

# Plausible (Required)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"

# Plausible Self-Hosted (Optional)
NEXT_PUBLIC_PLAUSIBLE_HOST="https://plausible.io"
```

## Best Practices

1. Always add context to errors
2. Use breadcrumbs before risky operations
3. Set user context after login, clear on logout
4. Track meaningful events, not every click
5. Use consistent event naming
6. Don't track PII or sensitive data
7. Review dashboards weekly

## Dashboards

- **Sentry**: [sentry.io/organizations/YOUR_ORG/issues/](https://sentry.io)
- **Plausible**: [plausible.io/yourdomain.com](https://plausible.io)

## Resources

- Full guide: See `MONITORING.md`
- Sentry docs: [docs.sentry.io](https://docs.sentry.io)
- Plausible docs: [plausible.io/docs](https://plausible.io/docs)
