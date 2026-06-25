# Analytics & Error Tracking Deployment Checklist

Use this checklist when deploying the application with Sentry and Plausible Analytics.

## Pre-Deployment

### Sentry Setup
- [ ] Create Sentry account at [sentry.io](https://sentry.io)
- [ ] Create new Next.js project in Sentry
- [ ] Copy DSN from project settings
- [ ] Create auth token for source maps (Settings → Account → API → Auth Tokens)
  - Scopes needed: `project:read`, `project:releases`, `org:read`
- [ ] Note organization slug and project slug

### Plausible Setup
- [ ] Choose deployment method:
  - [ ] Cloud: Sign up at [plausible.io](https://plausible.io)
  - [ ] Self-hosted: Deploy using Docker ([guide](https://plausible.io/docs/self-hosting))
- [ ] Add your domain to Plausible dashboard
- [ ] Note your domain exactly as configured (e.g., `example.com` or `www.example.com`)

## Environment Variables

### Required for All Environments

**Sentry**:
```bash
SENTRY_DSN="https://[key]@o[org-id].ingest.sentry.io/[project-id]"
NEXT_PUBLIC_SENTRY_DSN="https://[key]@o[org-id].ingest.sentry.io/[project-id]"
```

**Plausible**:
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
```

### Optional for Production

**Sentry Source Maps**:
```bash
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"
```

**Plausible Self-Hosted**:
```bash
NEXT_PUBLIC_PLAUSIBLE_HOST="https://your-plausible-instance.com"
```

## Deployment Platform Configuration

### Render.com

1. Navigate to your service in Render dashboard
2. Go to "Environment" tab
3. Add environment variables:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - (Optional) `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
4. Click "Save Changes"
5. Trigger manual deploy or push to repository

### Vercel

1. Navigate to project settings in Vercel dashboard
2. Go to "Environment Variables" section
3. Add all required variables for all environments (Production, Preview, Development)
4. Redeploy the application

### Docker

1. Update your `.env` file or Docker Compose configuration
2. Rebuild the Docker image:
   ```bash
   docker build -t your-app .
   ```
3. Run with environment variables:
   ```bash
   docker run -p 3000:3000 \
     -e SENTRY_DSN="..." \
     -e NEXT_PUBLIC_SENTRY_DSN="..." \
     -e NEXT_PUBLIC_PLAUSIBLE_DOMAIN="..." \
     your-app
   ```

## Post-Deployment Validation

### Sentry Validation

- [ ] Visit your deployed application
- [ ] Trigger a test error (use ExampleTracking component or temporary test code)
- [ ] Check Sentry dashboard for the error within 1 minute
- [ ] Verify error includes:
  - [ ] Correct environment tag (production/staging)
  - [ ] Readable stack trace (if source maps enabled)
  - [ ] User context (if user logged in)
  - [ ] Breadcrumbs (if any were added)
- [ ] Remove test error code

### Plausible Validation

- [ ] Visit your deployed application
- [ ] Open Plausible dashboard in another tab
- [ ] Wait 30 seconds
- [ ] Verify real-time visitor appears
- [ ] Navigate to different pages
- [ ] Verify pageviews are tracked
- [ ] Trigger custom event (if implemented)
- [ ] Check custom event appears in dashboard

### Source Maps Validation (Sentry)

- [ ] Check build logs for "Source maps uploaded to Sentry"
- [ ] Trigger an error in production
- [ ] Verify stack trace shows original TypeScript code, not minified JavaScript
- [ ] File paths should be like `app/api/users/route.ts:15` not `webpack:///./...`

## Alert Configuration

### Sentry Alerts

Set up the following alerts in Sentry:

- [ ] **Critical Error Alert**
  - When: Error occurs
  - Conditions: Environment = production, Level = error or fatal
  - Actions: Email team

- [ ] **Error Rate Alert**
  - When: Error rate > 1% in 1 hour
  - Actions: Slack notification

- [ ] **New Issue Alert**
  - When: New issue is created
  - Conditions: First seen
  - Actions: Email on-call

- [ ] **Performance Alert** (if using performance monitoring)
  - When: P95 response time > 1000ms for 5 minutes
  - Actions: Create issue

### Plausible Goals

Set up goals in Plausible for key actions:

- [ ] **Signup** (if applicable)
  - Custom event: `Signup`

- [ ] **Module Completion** (if applicable)
  - Custom event: `Module Completed`

- [ ] **Session Milestones** (if applicable)
  - Custom events: Various milestone events

- [ ] **Important Page Visits**
  - Page-based goals: `/dashboard`, `/checkout`, etc.

## Monitoring Setup

### Daily
- [ ] Check Sentry for critical errors
- [ ] Review error rate trends

### Weekly
- [ ] Review Plausible analytics summary
- [ ] Check goal conversion rates
- [ ] Review Sentry performance metrics
- [ ] Verify alerts are functioning

### Monthly
- [ ] Review and archive resolved Sentry issues
- [ ] Analyze traffic trends in Plausible
- [ ] Update alert thresholds if needed
- [ ] Review data retention policies

## Troubleshooting

### Sentry not receiving errors

1. Check environment variables are set correctly
2. Verify no ad blockers or privacy tools blocking Sentry
3. Check browser console for Sentry initialization errors
4. Ensure application is actually erroring (check server logs)
5. Verify DSN format is correct
6. Check network requests in browser DevTools

### Plausible not tracking

1. Verify domain in `.env` matches domain in Plausible dashboard exactly
2. Check no ad blockers are enabled
3. Verify script is loading (Network tab in DevTools)
4. For self-hosted: ensure Plausible instance is accessible
5. Check Plausible dashboard settings allow tracking
6. Verify NEXT_PUBLIC prefix is present (required for client-side access)

### Source maps not working

1. Ensure `SENTRY_AUTH_TOKEN` is set and valid
2. Check build logs for upload confirmation
3. Verify auth token has correct scopes
4. Ensure `productionBrowserSourceMaps: true` in `next.config.js`
5. Check Sentry project settings → Source Maps → Uploaded artifacts

## Rollback Plan

If analytics integration causes issues:

1. **Emergency Disable**:
   ```bash
   # Remove these environment variables
   unset SENTRY_DSN
   unset NEXT_PUBLIC_SENTRY_DSN
   unset NEXT_PUBLIC_PLAUSIBLE_DOMAIN
   ```

2. **Redeploy** the application

3. Application will continue to function without analytics

4. Fix issues and redeploy with analytics enabled

## Security Notes

- [ ] Never commit `.env` file to version control
- [ ] Use separate Sentry projects for staging and production
- [ ] Rotate auth tokens if compromised
- [ ] Review Sentry's data scrubbing rules
- [ ] Ensure no PII is sent to analytics services
- [ ] Set appropriate data retention policies (GDPR compliance)

## Success Criteria

Deployment is successful when:

- [ ] Sentry receives and displays errors from production
- [ ] Stack traces are readable (source maps working)
- [ ] Plausible tracks pageviews in real-time
- [ ] Custom events appear in Plausible dashboard
- [ ] Alerts are configured and tested
- [ ] No console errors related to analytics
- [ ] Application performance is unaffected
- [ ] Privacy policy updated (if required)

## Support Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Plausible Documentation](https://plausible.io/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Sentry Source Maps Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/)
