# Documentation Index

Complete documentation for Sentry error tracking and Plausible Analytics integration.

## Quick Links

- **Getting Started**: [ANALYTICS_QUICKSTART.md](./ANALYTICS_QUICKSTART.md)
- **Full Guide**: [../MONITORING.md](../MONITORING.md)
- **Deployment**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Migration**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Implementation Details**: [../IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)

## Documentation Overview

### For Developers

**Start Here**: [ANALYTICS_QUICKSTART.md](./ANALYTICS_QUICKSTART.md)
- Quick reference card
- Common use cases
- Code snippets
- Setup checklist

**Deep Dive**: [../MONITORING.md](../MONITORING.md) (12KB guide)
- Comprehensive setup instructions
- Implementation examples
- Best practices
- Troubleshooting guide
- KPIs and metrics

### For DevOps/SRE

**Deployment**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Pre-deployment checklist
- Environment variable configuration
- Platform-specific instructions
- Validation procedures
- Alert configuration
- Monitoring schedule

### For Teams Migrating

**Migration**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Step-by-step migration guide
- Integration with existing code
- Testing procedures
- Rollback plan
- Team onboarding

### Implementation Details

**Summary**: [../IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
- What was implemented
- File changes
- KPIs
- Validation procedures
- Next steps

## Document Structure

```
docs/
├── README.md                      # This file
├── ANALYTICS_QUICKSTART.md        # Quick reference (2 pages)
├── DEPLOYMENT_CHECKLIST.md        # Deployment guide (8 pages)
└── MIGRATION_GUIDE.md             # Migration guide (6 pages)

Root Documentation:
├── MONITORING.md                  # Comprehensive guide (12KB)
└── IMPLEMENTATION_SUMMARY.md      # Implementation details (5KB)
```

## Choose Your Path

### I'm a new developer on the project
→ Start with [ANALYTICS_QUICKSTART.md](./ANALYTICS_QUICKSTART.md)

### I need to deploy to production
→ Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### I'm adding this to an existing project
→ Use [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### I want comprehensive documentation
→ Read [../MONITORING.md](../MONITORING.md)

### I need implementation details
→ See [../IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)

## Key Concepts

### Sentry Error Tracking

Sentry captures and reports errors in real-time with:
- Full stack traces
- User context
- Breadcrumb trails
- Performance monitoring
- Source map support

**Free Tier**: 5,000 errors/month, 10,000 performance units/month

### Plausible Analytics

Plausible provides privacy-friendly analytics with:
- Automatic pageview tracking
- Custom event tracking
- No cookies or personal data
- GDPR/CCPA compliant
- Lightweight (<1KB)

**Pricing**: $9/month for 10k pageviews (cloud) or self-host for free

## Environment Variables

```bash
# Sentry (Required)
SENTRY_DSN="https://[key]@sentry.io/[project]"
NEXT_PUBLIC_SENTRY_DSN="https://[key]@sentry.io/[project]"

# Sentry Source Maps (Optional)
SENTRY_AUTH_TOKEN="your-token"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"

# Plausible (Required)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"

# Plausible Self-Hosted (Optional)
NEXT_PUBLIC_PLAUSIBLE_HOST="https://plausible.io"
```

## Usage Examples

### Track an Error

```typescript
import { captureException } from '@/lib/sentry'

try {
  await riskyOperation()
} catch (error) {
  captureException(error, { context: 'additional-info' })
}
```

### Track an Event

```typescript
import { trackEvent } from '@/lib/analytics'

trackEvent('button-clicked', { button: 'signup', location: 'hero' })
```

### Set User Context

```typescript
import { setUser } from '@/lib/sentry'

setUser({
  id: user.id,
  email: user.email,
  name: user.name,
})
```

## Dashboards

- **Sentry**: https://sentry.io/organizations/YOUR_ORG/issues/
- **Plausible**: https://plausible.io/yourdomain.com

## Support Resources

### Official Documentation
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Plausible Docs](https://plausible.io/docs)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### Code Examples
- `components/ExampleTracking.tsx` - Interactive demo
- `app/api/users/route.ts` - API integration
- `lib/sentry.ts` - Helper functions
- `lib/analytics.ts` - Analytics helpers

## Document Sizes

| Document | Size | Reading Time |
|----------|------|--------------|
| ANALYTICS_QUICKSTART.md | 2 KB | 2 minutes |
| DEPLOYMENT_CHECKLIST.md | 9 KB | 10 minutes |
| MIGRATION_GUIDE.md | 8 KB | 8 minutes |
| MONITORING.md | 12 KB | 15 minutes |
| IMPLEMENTATION_SUMMARY.md | 8 KB | 10 minutes |
| **Total** | **39 KB** | **45 minutes** |

## Maintenance

These documents should be updated when:
- Sentry or Plausible APIs change
- New features are added
- Best practices evolve
- Team feedback suggests improvements

## Contributing

To improve this documentation:
1. Identify gaps or unclear sections
2. Add examples or clarifications
3. Update based on real-world usage
4. Keep examples simple and practical

## Version History

- **v1.0** (2026-06-25): Initial implementation
  - Sentry integration complete
  - Plausible integration complete
  - Comprehensive documentation
  - Example components
  - Deployment guides

## Quick Troubleshooting

### Sentry not working?
1. Check `SENTRY_DSN` is set
2. Verify no ad blockers
3. Check browser console for errors
4. Test with a simple `throw new Error('test')`

### Plausible not tracking?
1. Verify `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is correct
2. Check script is loading (Network tab)
3. Ensure no ad blockers
4. Wait 30 seconds for real-time data

### Source maps not working?
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check build logs for upload confirmation
3. Ensure token has correct permissions
4. Verify `productionBrowserSourceMaps: true` in config

## Feedback

If you find issues or have suggestions for this documentation:
1. Create an issue describing the problem
2. Include which document needs improvement
3. Suggest specific changes if possible

---

**Last Updated**: 2026-06-25
**Maintained By**: Development Team
**Total Documentation**: ~2,000 lines across 5 files
