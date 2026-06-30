# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Sentry & Plausible Analytics Integration

### Added

#### Error Tracking (Sentry)
- Integrated `@sentry/nextjs` for comprehensive error tracking and monitoring
- Created `sentry.client.config.ts` for browser-side error capture
  - Automatic error and unhandled promise rejection tracking
  - Session Replay (10% of sessions, 100% on errors)
  - PII scrubbing via `beforeSend` hook (URLs, headers, emails)
  - Performance monitoring (10% sample rate)
- Created `sentry.server.config.ts` for server-side error tracking
- Created `sentry.edge.config.ts` for edge runtime support
- Added global error boundary (`app/error.tsx` and `components/ErrorBoundary.tsx`)
  - User-friendly error display
  - Automatic error reporting to Sentry
  - "Try again" recovery functionality
- Updated `next.config.js` with Sentry webpack plugin configuration
- Added Sentry environment variables to `.env.example`:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`

#### Analytics (Plausible)
- Integrated `plausible-tracker` for privacy-friendly analytics
- Created `lib/analytics.ts` with:
  - Automatic pageview tracking
  - Session duration tracking (5-minute intervals)
  - Type-safe custom event system
  - Pre-configured event types: `budget_created`, `session_active`, `api_call`, `user_action`
- Created `components/PlausibleScript.tsx` for analytics initialization
- Updated root layout (`app/layout.tsx`) to include Plausible tracking
- Added Plausible environment variables to `.env.example`:
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
  - `NEXT_PUBLIC_PLAUSIBLE_API_HOST`

#### Demo & Testing
- Created `components/BudgetDemo.tsx` demonstrating:
  - Custom event tracking for budget creation
  - Error boundary testing
  - Sentry breadcrumb integration
  - Interactive form with analytics
- Created `lib/analytics-test.ts` with comprehensive testing utilities:
  - `analyticsTest.runAll()` - Run all integration tests
  - `analyticsTest.verify()` - Check configuration status
  - Individual test functions for Sentry and Plausible
  - Browser console access for easy testing

#### Documentation
- Created `ANALYTICS.md` - Comprehensive analytics integration guide
  - Detailed setup instructions for Sentry and Plausible
  - Dashboard monitoring checklist with KR targets (<1% error rate, ≥5 min sessions)
  - Custom event tracking examples
  - Privacy and GDPR compliance information
  - Troubleshooting guide
  - Cost optimization tips
- Created `ANALYTICS_QUICKSTART.md` - 5-minute quick start guide
  - Step-by-step setup instructions
  - Environment configuration
  - Testing procedures
  - Common troubleshooting scenarios
- Updated `README.md` with:
  - Error Tracking & Analytics section
  - Sentry and Plausible setup instructions
  - Analytics dashboard checklist with KR targets
  - Custom event tracking examples
  - Testing instructions
  - Updated features list and project structure

#### Configuration
- Updated `package.json` dependencies:
  - Added `@sentry/nextjs: ^7.99.0`
  - Added `plausible-tracker: ^0.3.9`
- Updated `.gitignore` to exclude Sentry configuration files:
  - `.sentryclirc`
  - `sentry.properties`

### Changed
- Modified `app/layout.tsx` to include `PlausibleScript` component
- Modified `app/page.tsx` to include `BudgetDemo` component for demonstration
- Enhanced `next.config.js` with Sentry webpack plugin integration

### Key Features

#### Error Monitoring
- Automatic capture of all unhandled errors
- React error boundaries with user-friendly fallbacks
- Stack traces with source maps
- PII scrubbing for sensitive data
- Breadcrumb tracking for debugging context
- Performance monitoring and tracing

#### Analytics Tracking
- Privacy-friendly, GDPR-compliant analytics
- No cookies required
- Automatic pageview tracking for SPA
- Custom event tracking system
- Session duration monitoring
- Real-time dashboard access

#### KR Targets
- **Error Rate**: <1% (monitored via Sentry dashboard)
- **Session Duration**: ≥5 minutes (monitored via Plausible dashboard)

### Developer Experience
- Type-safe event tracking API
- Browser console test utilities
- Comprehensive documentation
- Quick start guide for rapid onboarding
- Demo component showing integration patterns

### Security & Privacy
- PII scrubbing in Sentry (tokens, passwords, emails)
- No personal data collected by Plausible
- IP address anonymization
- GDPR compliant by default
- Configurable data retention

### Files Added
```
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
app/error.tsx
components/ErrorBoundary.tsx
components/PlausibleScript.tsx
components/BudgetDemo.tsx
lib/analytics.ts
lib/analytics-test.ts
ANALYTICS.md
ANALYTICS_QUICKSTART.md
CHANGELOG.md
```

### Files Modified
```
package.json
.env.example
.gitignore
next.config.js
app/layout.tsx
app/page.tsx
README.md
```

## Migration Guide

For existing deployments:

1. **Install new dependencies**:
   ```bash
   npm install
   ```

2. **Update environment variables** (see `.env.example`):
   ```bash
   cp .env.example .env
   # Fill in your Sentry DSN and Plausible domain
   ```

3. **Rebuild the application**:
   ```bash
   npm run build
   ```

4. **Deploy** and verify integrations using browser console:
   ```javascript
   analyticsTest.runAll()
   ```

5. **Configure Plausible goals** in dashboard:
   - Navigate to Settings → Goals
   - Add custom events: `budget_created`, `session_active`, `user_action`

6. **Set up Sentry alerts**:
   - Navigate to Alerts in Sentry dashboard
   - Create alert for error spike (>5 errors/hour)

## Notes

- Sentry source map uploads are optional but recommended for production
- Plausible can be self-hosted as an alternative to cloud service
- Both services offer free tiers suitable for small to medium projects
- Test utilities are only loaded in development mode
