# Analytics Quick Start Guide

Get up and running with Sentry and Plausible Analytics in 5 minutes.

## Prerequisites

- Sentry account (free tier: [sentry.io/signup](https://sentry.io/signup))
- Plausible account (free trial: [plausible.io/register](https://plausible.io/register)) OR self-hosted instance

## Step 1: Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your credentials:
```bash
# Sentry (get from https://sentry.io/settings/projects/)
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-name"

# Plausible (get from https://plausible.io/settings)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
NEXT_PUBLIC_PLAUSIBLE_API_HOST="https://plausible.io"
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run the Application

```bash
npm run dev
```

## Step 4: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Open the browser console (F12)
3. Run the test command:
   ```javascript
   analyticsTest.runAll()
   ```
4. Check your dashboards:
   - Sentry: `https://sentry.io/organizations/[org]/issues/`
   - Plausible: `https://plausible.io/[domain]`

## Step 5: Configure Plausible Goals

1. Go to your Plausible dashboard
2. Navigate to Settings → Goals
3. Add these custom events:
   - `budget_created`
   - `session_active`
   - `user_action`

## Verify Everything Works

### Test Error Tracking
Click the "Test Error Boundary" button on the home page. You should see:
- Error caught by error boundary
- Error appears in Sentry dashboard within 1-2 minutes

### Test Analytics Events
Fill out the budget form and click "Create Budget". You should see:
- `budget_created` event in Plausible dashboard
- Session tracking in Plausible

### Check Metrics
After 24 hours, verify:
- [ ] Sentry shows <1% error rate
- [ ] Plausible shows average session ≥5 minutes
- [ ] Custom events are being tracked

## Troubleshooting

### Nothing appears in Sentry
- Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Verify DSN starts with `https://`
- Check browser console for errors

### Nothing appears in Plausible
- Verify `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matches your Plausible site exactly
- Check you added the site in Plausible dashboard first
- Ensure domain doesn't include `https://` or trailing `/`

### Environment variables not loading
- Restart dev server after changing `.env`
- Check variable names start with `NEXT_PUBLIC_` for client-side access
- Verify `.env` is in project root

## Next Steps

- Read [ANALYTICS.md](./ANALYTICS.md) for comprehensive documentation
- Set up Sentry alerts for error spikes
- Configure Plausible email reports
- Add custom events for your specific use cases

## Key Files

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Client-side error tracking config |
| `sentry.server.config.ts` | Server-side error tracking config |
| `lib/analytics.ts` | Plausible event tracking utilities |
| `components/PlausibleScript.tsx` | Plausible initialization |
| `app/error.tsx` | Error boundary for React errors |

## Support

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Plausible Docs: https://plausible.io/docs
- GitHub Issues: [Report a bug](https://github.com/your-repo/issues)
