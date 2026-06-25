# Next.js Minimal Vercel

A minimal full-stack scaffold using Next.js 14 (App Router) with TypeScript, Tailwind CSS, and SQLite via Prisma. Designed for fast iteration with zero-config deployment on Vercel.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** ORM with PostgreSQL database
- **Sentry** error tracking and monitoring
- **Plausible Analytics** privacy-friendly analytics
- **ESLint & Prettier** for code quality
- **GitHub Actions** CI/CD pipeline
- **Vercel** ready for zero-config deployment

## Project Structure

```
.
├── app/                    # Next.js App Router pages and routes
│   ├── api/               # API routes
│   │   └── users/         # Example user API endpoints
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── components/            # Reusable React components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ErrorBoundary.tsx  # React error boundary with Sentry
├── lib/                   # Utility functions and shared code
│   ├── analytics.ts       # Plausible Analytics helpers
│   ├── prisma.ts          # Prisma client singleton
│   ├── sentry.ts          # Sentry error tracking helpers
│   └── utils.ts           # General utilities
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
├── sentry.client.config.ts # Sentry client-side configuration
├── sentry.server.config.ts # Sentry server-side configuration
├── sentry.edge.config.ts   # Sentry edge runtime configuration
├── .github/
│   └── workflows/
│       └── ci.yml         # CI pipeline (lint, test, build)
├── .env.example           # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nextjs-minimal-vercel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma migrate dev --name init
```

This will create a SQLite database at `prisma/dev.db` and generate the Prisma Client.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Database

This project uses Prisma with PostgreSQL for production deployments. The schema includes two example models:

- **User** - Basic user information with email and name
- **Post** - Blog posts linked to users

**For local development**: You can use PostgreSQL locally, or temporarily switch to SQLite by changing `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma` and using `DATABASE_URL="file:./dev.db"`.

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (Warning: deletes all data)
npx prisma migrate reset
```

## API Routes

Example API route at `/api/users`:

- `GET /api/users` - Fetch all users with their posts
- `POST /api/users` - Create a new user (requires `email` in request body)

Example request:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

## Error Tracking and Analytics

This project integrates with Sentry for error tracking and Plausible Analytics for privacy-friendly web analytics.

### Sentry Error Tracking

Sentry provides real-time error monitoring, performance tracking, and source map support for debugging production issues.

#### Setup

1. Create a free account at [sentry.io](https://sentry.io)
2. Create a new Next.js project in Sentry
3. Copy your DSN from the project settings
4. Add to your environment variables:

```bash
SENTRY_DSN="https://your-key@sentry.io/your-project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/your-project-id"
```

#### Source Maps (Optional but Recommended)

To upload source maps for readable stack traces in production:

1. Create an auth token at [sentry.io/settings/account/api/auth-tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Add to your environment variables:

```bash
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"
```

Source maps will be automatically uploaded during the build process.

#### Usage

The project includes automatic error tracking via:
- Global error boundary wrapping the entire app
- API route error handlers with context
- Client-side error capturing

**Manual error tracking**:

```typescript
import { captureException, addBreadcrumb } from '@/lib/sentry'

// Track an error with context
try {
  await riskyOperation()
} catch (error) {
  captureException(error, {
    operation: 'riskyOperation',
    userId: user.id,
  })
}

// Add debugging breadcrumbs
addBreadcrumb({
  message: 'User clicked button',
  category: 'user-action',
  level: 'info',
})
```

#### Sentry Dashboard

Access your Sentry dashboard to:
- View real-time error reports with stack traces
- Set up alert rules for error rate thresholds
- Monitor performance metrics
- Track release health

**Recommended Alerts**:
- Error rate exceeds 1% of total requests
- New issue detected in production
- Performance degradation (P95 response time > 1s)

**Free Tier**: 5,000 errors/month, 10,000 performance units/month

### Plausible Analytics

Plausible is a privacy-friendly, lightweight alternative to Google Analytics with no cookies or personal data tracking.

#### Setup

**Option 1: Plausible Cloud (Recommended)**

1. Create an account at [plausible.io](https://plausible.io)
2. Add your domain to Plausible
3. Set your environment variable:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
```

**Option 2: Self-Hosted**

1. Deploy Plausible using Docker:

```bash
git clone https://github.com/plausible/hosting
cd hosting
docker-compose up -d
```

2. Set environment variables:

```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"
NEXT_PUBLIC_PLAUSIBLE_HOST="https://your-plausible-instance.com"
```

#### Custom Event Tracking

The project includes helper functions for tracking custom events:

```typescript
import {
  trackEvent,
  trackModuleCompletion,
  trackSessionMilestone,
  trackButtonClick,
} from '@/lib/analytics'

// Track module completion
trackModuleCompletion('Getting Started Tutorial', 120) // 120 seconds

// Track session milestones
trackSessionMilestone('First Login')
trackSessionMilestone('Profile Complete')

// Track button clicks
trackButtonClick('Sign Up', 'hero-section')

// Track custom events
trackEvent('Feature Used', {
  feature: 'dark-mode',
  enabled: true,
})
```

#### Plausible Dashboard

Access your Plausible dashboard to:
- View real-time visitor statistics
- Track pageviews and unique visitors
- Monitor custom event conversions
- Analyze session duration and bounce rate
- View traffic sources and devices

**Key Metrics**:
- **Session Duration**: Averages typically range from 2-5 minutes for web apps
- **Custom Events**: Track module completions, signups, feature usage
- **Goal Conversions**: Set up goals for important user actions

**Pricing**:
- Cloud: Starts at $9/month for 10k pageviews
- Self-hosted: Free (requires your own infrastructure)

### Privacy & GDPR Compliance

Both Sentry and Plausible are designed with privacy in mind:

- **Sentry**: Automatically scrubs sensitive data (passwords, tokens, PII)
- **Plausible**: No cookies, no personal data collection, GDPR/CCPA compliant by default

## Deployment

### Render.com (Recommended for Full-Stack)

This project includes complete Render.com deployment configuration with managed PostgreSQL:

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will detect `render.yaml` and provision:
   - Web Service (Next.js app in Docker)
   - PostgreSQL Database (free tier, 1GB)
   - Automatic TLS/HTTPS
6. Add environment variables in Render dashboard:
   - `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - Optional: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` for source maps
7. Click "Apply" to deploy

**Free tier includes**: 750 hours/month web service + PostgreSQL with 1GB storage.

**Public URL**: `https://adulting-app.onrender.com` (or your custom domain)

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment guide, troubleshooting, and configuration options.

### Vercel (Alternative)

This project can also be deployed on Vercel:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and configure the build settings
4. Add environment variables in Vercel dashboard:
   - Database: `DATABASE_URL`
   - Sentry: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
   - Analytics: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   - Optional: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
5. Use a hosted PostgreSQL database:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Neon](https://neon.tech/)
   - [Supabase](https://supabase.com/)
6. Update `DATABASE_URL` in Vercel environment variables
7. Deploy

**Note**: The Prisma schema now uses PostgreSQL by default. For local development with SQLite, temporarily change the provider in `prisma/schema.prisma`.

## Code Quality

This project includes:

- **ESLint** - Configured with Next.js recommended rules
- **Prettier** - For consistent code formatting
- **TypeScript** - Strict mode enabled
- **GitHub Actions** - Automated CI pipeline

The CI pipeline runs on every push and pull request, checking:
- Linting
- Type checking
- Code formatting
- Tests
- Build success

## License

MIT
