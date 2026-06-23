# Adulting App - GCP Cloud Run Deployment

A production-ready Next.js full-stack application deployed to Google Cloud Run with Cloud SQL PostgreSQL.

## Quick Deploy

Deploy to GCP Cloud Run in minutes:

```bash
# 1. Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# 2. Run the deployment script
./deploy-gcp.sh
```

The script outputs your live HTTPS URL when complete.

## What's Deployed

- **Next.js 14** full-stack application
- **Cloud Run** serverless container (auto-scaling, HTTPS)
- **Cloud SQL** PostgreSQL 15 database
- **Secret Manager** for secure credential storage
- **Automatic TLS** certificate on `*.run.app` domain

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 15 (via Cloud SQL)
- **ORM**: Prisma 5.9
- **Styling**: Tailwind CSS
- **Platform**: GCP Cloud Run

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/users/         # API endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema
│   └── schema.prisma
├── deploy-gcp.sh         # Automated GCP deployment
├── migrate-db.sh         # Database migration script
├── Dockerfile            # Multi-stage production build
└── GCP_DEPLOYMENT.md     # Detailed deployment guide

```

## Local Development

```bash
# Install dependencies
npm install

# Set up local database (SQLite for dev)
echo 'DATABASE_URL="file:./dev.db"' > .env

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (Cloud SQL)
DATABASE_URL="postgresql://user:pass@localhost/db?host=/cloudsql/CONNECTION_NAME"

# GCP Configuration
GCP_PROJECT_ID="your-project-id"
GCP_REGION="us-central1"
```

## Deployment

### Automated Deployment

```bash
./deploy-gcp.sh
```

### Manual Steps

See [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) for detailed instructions.

### Post-Deployment

Run database migrations:

```bash
# Using the migration script
./migrate-db.sh

# Or manually with Cloud SQL Proxy
./cloud_sql_proxy -instances=CONNECTION_NAME=tcp:5432 &
export DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)
npx prisma migrate deploy
```

## Features

- Server-side rendering (SSR)
- API routes (RESTful endpoints)
- Database ORM with Prisma
- TypeScript type safety
- Tailwind CSS styling
- Automatic HTTPS
- Auto-scaling (0 to 10 instances)
- Zero-downtime deployments

## API Endpoints

- `GET /api/users` - List all users
- `POST /api/users` - Create a new user

Example:
```bash
# Get your Cloud Run URL
URL=$(gcloud run services describe adulting-app --format="value(status.url)")

# Test API
curl $URL/api/users
```

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Monitoring

View logs:
```bash
gcloud run services logs tail adulting-app --region=us-central1
```

Cloud Console:
```
https://console.cloud.google.com/run
```

## Scaling Configuration

- **Min instances**: 0 (scales to zero when idle)
- **Max instances**: 10
- **Memory**: 512 MiB
- **CPU**: 1 core
- **Timeout**: 300s

Modify in `deploy-gcp.sh` or:
```bash
gcloud run services update adulting-app \
  --min-instances=1 \
  --max-instances=20 \
  --memory=1Gi
```

## Costs

Estimated monthly costs:
- **Cloud Run**: ~$0-5 (mostly free tier)
- **Cloud SQL**: ~$7-10 (db-f1-micro)
- **Cloud Build**: Free (120 min/day)
- **Total**: ~$7-15/month

Scale to zero for minimal costs when idle.

## Security

- Secrets stored in Secret Manager
- TLS/HTTPS enabled by default
- Cloud SQL proxy for secure DB connections
- Private container registry (GCR)
- IAM-based access control

## Custom Domain

Map your domain:
```bash
gcloud run domain-mappings create \
  --service=adulting-app \
  --domain=yourdomain.com
```

## Updating

Redeploy after changes:
```bash
./deploy-gcp.sh
```

Or manually:
```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/adulting-app
gcloud run deploy adulting-app --image gcr.io/$PROJECT_ID/adulting-app
```

## Troubleshooting

**Container won't start:**
```bash
gcloud run services logs read adulting-app --limit=50
```

**Database connection issues:**
```bash
gcloud sql instances describe adulting-db
```

**Build failures:**
```bash
gcloud builds list --limit=5
```

See [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) for detailed troubleshooting.

## Documentation

- [Full Deployment Guide](./GCP_DEPLOYMENT.md) - Comprehensive GCP setup
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## License

MIT

## Support

For deployment issues, check:
- Cloud Run logs
- Cloud SQL status
- Secret Manager configuration

For application issues, review the Next.js and Prisma documentation.
