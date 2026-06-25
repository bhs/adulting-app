# Migration Guide: Adding Analytics to Existing Codebase

If you're adding this analytics integration to an existing Next.js project, follow this guide.

## Prerequisites

- Next.js 14+ with App Router
- Node.js 20+
- TypeScript configured

## Step-by-Step Migration

### 1. Install Dependencies

```bash
npm install @sentry/nextjs
```

### 2. Copy Configuration Files

Copy these files to your project root:

```
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
```

### 3. Update Next.js Configuration

Update your `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // Your existing config...
  productionBrowserSourceMaps: true, // Add this
}

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
```

### 4. Copy Library Files

Copy these utility files:

```
lib/sentry.ts
lib/analytics.ts
```

### 5. Copy Components

Copy these components:

```
components/ErrorBoundary.tsx
components/ExampleTracking.tsx (optional, for testing)
app/global-error.tsx
```

### 6. Update Root Layout

Update `app/layout.tsx`:

```typescript
import Script from 'next/script'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  const plausibleHost = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io'

  return (
    <html lang="en">
      <head>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src={`${plausibleHost}/js/script.js`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
```

### 7. Update API Routes

For each API route, add error tracking:

```typescript
import { captureException, addBreadcrumb } from '@/lib/sentry'

export async function POST(request: Request) {
  try {
    addBreadcrumb({
      message: 'Processing request',
      category: 'api',
    })

    // Your logic...

    return NextResponse.json({ success: true })
  } catch (error) {
    captureException(error, {
      endpoint: '/api/your-endpoint',
      method: 'POST',
    })

    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}
```

### 8. Add Environment Variables

Update your `.env.example` and `.env`:

```bash
# Sentry
SENTRY_DSN="https://[key]@sentry.io/[project]"
NEXT_PUBLIC_SENTRY_DSN="https://[key]@sentry.io/[project]"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-token"

# Plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
NEXT_PUBLIC_PLAUSIBLE_HOST="https://plausible.io"
```

### 9. Update .gitignore

Add to `.gitignore`:

```
# Sentry
.sentryclirc
sentry.properties
```

### 10. Copy Documentation (Optional)

Copy these documentation files for your team:

```
MONITORING.md
docs/ANALYTICS_QUICKSTART.md
docs/DEPLOYMENT_CHECKLIST.md
```

## Integrating with Existing Error Handling

If you already have error handling, integrate Sentry:

### Existing try-catch blocks

```typescript
// Before
try {
  await operation()
} catch (error) {
  console.error(error)
  throw error
}

// After
import { captureException } from '@/lib/sentry'

try {
  await operation()
} catch (error) {
  captureException(error, { operation: 'operation-name' })
  console.error(error)
  throw error
}
```

### Existing Error Boundaries

If you have custom error boundaries, add Sentry:

```typescript
import * as Sentry from '@sentry/nextjs'

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Your existing logic...

  // Add this
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  })
}
```

### Existing Analytics

If you have Google Analytics or other analytics:

```typescript
// You can use both side by side
trackEvent('button-click', { button: 'signup' }) // Plausible
gtag('event', 'button-click', { button: 'signup' }) // Google Analytics
```

## Integrating with Existing User Management

Set user context after authentication:

```typescript
import { setUser } from '@/lib/sentry'

// After successful login
async function handleLogin(credentials) {
  const user = await authenticate(credentials)

  // Set Sentry user context
  setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  })

  // Your existing logic...
}

// After logout
async function handleLogout() {
  // Clear Sentry user context
  setUser(null)

  // Your existing logic...
}
```

## Migrating Existing Components

### Client Components

Add analytics to button clicks:

```typescript
'use client'

import { trackButtonClick } from '@/lib/analytics'

export function MyButton() {
  const handleClick = () => {
    trackButtonClick('my-button', 'my-component')
    // Your existing logic...
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### Server Components

Set user context in server components:

```typescript
import { setUser } from '@/lib/sentry'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (user) {
    setUser({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  }

  return <div>Profile content...</div>
}
```

## Testing the Migration

1. **Test Sentry**:
   ```typescript
   // Add temporarily to a page
   'use client'

   export default function TestPage() {
     if (typeof window !== 'undefined') {
       throw new Error('Test Sentry')
     }
     return <div>Test</div>
   }
   ```

2. **Test Plausible**:
   - Visit your site
   - Check Plausible dashboard
   - Verify pageview appears

3. **Test Custom Events**:
   ```typescript
   import { trackEvent } from '@/lib/analytics'
   trackEvent('test', { working: true })
   ```

## Common Migration Issues

### Issue: Build fails with Sentry errors

**Solution**: Check `next.config.js` syntax and ensure `@sentry/nextjs` is installed.

### Issue: Sentry not capturing errors

**Solution**: Verify environment variables are set and DSN is correct.

### Issue: Plausible not tracking

**Solution**: Check `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matches your domain exactly.

### Issue: TypeScript errors

**Solution**: Ensure all type imports are correct and run `npm install` again.

### Issue: Source maps not uploading

**Solution**: Verify `SENTRY_AUTH_TOKEN` has correct permissions and is set in build environment.

## Rollback Plan

If migration causes issues:

1. Remove Sentry config from `next.config.js`
2. Remove ErrorBoundary from `app/layout.tsx`
3. Remove Plausible script from `app/layout.tsx`
4. Remove environment variables
5. Rebuild and redeploy

The application will continue to work without analytics.

## Performance Impact

Expected performance impact:

- **Bundle Size**: +50KB gzipped (Sentry client)
- **Page Load**: +20-50ms (Plausible script)
- **Runtime Overhead**: Negligible (<1ms per operation)

Both services are optimized for production use and should not noticeably impact performance.

## Gradual Rollout

For large applications, consider gradual rollout:

### Phase 1: Error Tracking Only
- Deploy Sentry configuration
- Test for 1 week
- Monitor error rates

### Phase 2: Add Analytics
- Deploy Plausible integration
- Test for 1 week
- Verify tracking

### Phase 3: Add Custom Events
- Add custom event tracking to key actions
- Review analytics data
- Adjust as needed

### Phase 4: Full Integration
- Add tracking to all components
- Set up alerts and goals
- Document for team

## Team Onboarding

Share these resources with your team:

1. `docs/ANALYTICS_QUICKSTART.md` - Quick reference
2. `MONITORING.md` - Comprehensive guide
3. `docs/DEPLOYMENT_CHECKLIST.md` - Deployment steps

Schedule a team meeting to:
- Demo error tracking
- Show analytics dashboard
- Review coding patterns
- Answer questions

## Support

If you encounter issues during migration:

1. Check `MONITORING.md` troubleshooting section
2. Review Sentry documentation
3. Review Plausible documentation
4. Check GitHub issues in this repository

## Next Steps After Migration

1. Set up Sentry alerts
2. Configure Plausible goals
3. Add custom events for key user actions
4. Schedule weekly analytics review
5. Update privacy policy if needed

## Success Criteria

Migration is successful when:

- [ ] Build completes without errors
- [ ] Application runs without console errors
- [ ] Sentry receives test errors
- [ ] Plausible tracks pageviews
- [ ] Custom events appear in dashboards
- [ ] No performance degradation
- [ ] Team is trained on usage

---

**Estimated Migration Time**: 2-4 hours
**Recommended Team Size**: 1-2 developers
**Testing Time**: 1-2 days
**Rollout Time**: 1 week (gradual rollout)
