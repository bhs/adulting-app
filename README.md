# Next.js Minimal Vercel

A minimal full-stack scaffold using Next.js 14 (App Router) with TypeScript, Tailwind CSS, and SQLite via Prisma. Designed for fast iteration with zero-config deployment on Vercel.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** ORM with SQLite database
- **OpenTelemetry** instrumentation for observability
- **Grafana Stack** for monitoring (Prometheus, Loki, Tempo)
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
│   └── Card.tsx
├── lib/                   # Utility functions and shared code
│   ├── prisma.ts          # Prisma client singleton
│   └── otel-browser.tsx   # Browser-side OpenTelemetry instrumentation
├── observability/         # Observability stack configuration
│   ├── otel-collector-config.yaml  # OpenTelemetry Collector config
│   ├── prometheus.yml     # Prometheus configuration
│   ├── loki-config.yaml   # Loki (logs) configuration
│   ├── tempo-config.yaml  # Tempo (traces) configuration
│   ├── grafana/           # Grafana dashboards and datasources
│   └── README.md          # Observability documentation
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
├── instrumentation.ts     # Server-side OpenTelemetry instrumentation
├── docker-compose.yml     # Full stack with observability
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

### Development with Full Observability Stack

To run the application with the complete observability stack (OpenTelemetry, Grafana, Prometheus, Loki, Tempo):

```bash
# Start everything with Docker Compose
docker-compose up -d

# Or use the helper script
./observability/start-observability.sh
```

This will start:
- **Application**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200
- **OpenTelemetry Collector**: http://localhost:4318

See [observability/README.md](./observability/README.md) for detailed documentation on the observability stack, dashboards, and alerts.

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

## Observability & Monitoring

This application is fully instrumented with OpenTelemetry, providing comprehensive observability:

### Instrumentation

- **Server-side**: Automatic HTTP, Express, and database instrumentation
- **Client-side**: Browser traces, session duration metrics, error tracking
- **Telemetry**: Traces, metrics, and logs exported to Grafana stack

### Grafana Dashboards

Three pre-configured dashboards for monitoring:

1. **Node.js Application Overview**
   - HTTP request rate and latency
   - Response time percentiles (P50, P90, P95, P99)
   - Error rate tracking

2. **Error Tracking Dashboard**
   - Real-time error rate monitoring
   - Error breakdown by status code and endpoint
   - Browser error tracking
   - Error logs aggregation

3. **Session Analytics Dashboard**
   - Session duration histogram
   - Page view metrics
   - User engagement analytics

### Alert Rules

Six pre-configured alert rules:
- High error rate (>5% for 5 min) - Critical
- Sustained error rate (>1% for 10 min) - Warning
- High session duration (P95 >5 min) - Warning
- Low session duration (P50 <10 sec) - Warning
- Browser error spike - Warning
- No traffic detected - Critical

See [observability/README.md](./observability/README.md) for complete documentation.

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
