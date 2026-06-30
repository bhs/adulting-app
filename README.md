# Next.js Minimal Vercel

A minimal full-stack scaffold using Next.js 14 (App Router) with TypeScript, Tailwind CSS, and SQLite via Prisma. Designed for fast iteration with zero-config deployment on Vercel.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** ORM with SQLite database
- **Sentry** for error tracking and monitoring
- **Plausible Analytics** for privacy-friendly analytics
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
│   ├── BudgetDemo.tsx     # Analytics demo component
│   ├── ErrorBoundary.tsx  # Sentry error boundary
│   ├── PlausibleScript.tsx # Plausible analytics tracker
│   ├── Button.tsx
│   └── Card.tsx
├── lib/                   # Utility functions and shared code
│   ├── analytics.ts       # Plausible event tracking utilities
│   └── prisma.ts          # Prisma client singleton
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
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

## Error Tracking & Analytics

This application integrates **Sentry** for error tracking and **Plausible Analytics** for privacy-friendly session metrics.

### Sentry Setup

1. Create a free Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for Next.js
3. Copy your DSN from the project settings
4. Add to your `.env` file:
```bash
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-auth-token"  # Optional, for source map uploads
```

### Plausible Analytics Setup

Choose one of these options:

**Option A: Plausible Cloud (Recommended)**
1. Sign up at [plausible.io](https://plausible.io) (30-day free trial)
2. Add your domain (e.g., `your-app.com`)
3. Add to your `.env` file:
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="your-app.com"
NEXT_PUBLIC_PLAUSIBLE_API_HOST="https://plausible.io"
```

**Option B: Self-Hosted Plausible**
1. Deploy Plausible following their [self-hosting guide](https://plausible.io/docs/self-hosting)
2. Add to your `.env` file:
```bash
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="your-app.com"
NEXT_PUBLIC_PLAUSIBLE_API_HOST="https://your-plausible-instance.com"
```

### Analytics Dashboard Checklist

Monitor these KPIs to validate application health:

#### Sentry Error Tracking
Access your Sentry dashboard at `https://sentry.io/organizations/[org]/issues/`

**Target KR: <1% Error Rate**

- [ ] Check **Issues** page for unhandled exceptions
- [ ] Review error rate trend over the last 7 days
- [ ] Filter by `handled:no` to see critical errors
- [ ] Set up alerts for error spikes (>5 errors/hour)
- [ ] Review stack traces and component context
- [ ] Check **Performance** tab for slow transactions (>1s)

**Key Metrics to Monitor:**
- Error count per day
- Affected users count
- Most common error types
- Error-free sessions percentage

#### Plausible Analytics
Access your Plausible dashboard at `https://plausible.io/[your-domain]`

**Target KR: ≥5 Minute Average Session Duration**

- [ ] Check **Time on Page** metric (target: ≥5 minutes)
- [ ] Review **Unique Visitors** trend
- [ ] Monitor **Bounce Rate** (target: <70%)
- [ ] Check **Goal Conversions** for custom events:
  - `budget_created` - tracks budget creation actions
  - `session_active` - tracks active session duration
  - `user_action` - tracks general user interactions
- [ ] Review **Countries** and **Devices** breakdown
- [ ] Check **Entry Pages** and **Exit Pages**

**Custom Events Setup:**
1. In Plausible dashboard, go to Settings → Goals
2. Add custom events:
   - `budget_created` (with properties: amount, category)
   - `session_active` (with property: duration)
   - `user_action` (with properties: action, component)

### Using Analytics in Your Code

**Track Custom Events:**
```typescript
import { trackCustomEvent } from '@/lib/analytics'

// Track a budget creation
trackCustomEvent({
  name: 'budget_created',
  props: { amount: 100, category: 'groceries' }
})

// Track user actions
trackCustomEvent({
  name: 'user_action',
  props: { action: 'button_click', component: 'header' }
})
```

**Capture Errors to Sentry:**
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // Your code
} catch (error) {
  Sentry.captureException(error)
}
```

**Add Breadcrumbs for Context:**
```typescript
Sentry.addBreadcrumb({
  category: 'action',
  message: 'User clicked submit button',
  level: 'info'
})
```

### Testing Analytics Integration

Open your browser console and run:
```javascript
// Verify configuration
analyticsTest.verify()

// Run all integration tests
analyticsTest.runAll()

// Test specific integrations
analyticsTest.sentry.error()
analyticsTest.plausible.events()
```

For detailed documentation, see [ANALYTICS.md](./ANALYTICS.md).

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

This will install all required packages including:
- `@sentry/nextjs` - Error tracking and performance monitoring
- `plausible-tracker` - Privacy-friendly analytics

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
6. Click "Apply" to deploy

**Free tier includes**: 750 hours/month web service + PostgreSQL with 1GB storage.

**Public URL**: `https://adulting-app.onrender.com` (or your custom domain)

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment guide, troubleshooting, and configuration options.

### Vercel (Alternative)

This project can also be deployed on Vercel:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and configure the build settings
4. Add environment variables in Vercel dashboard (see `.env.example`)
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
