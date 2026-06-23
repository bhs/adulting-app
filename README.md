# Next.js Minimal Vercel

A minimal full-stack scaffold using Next.js 14 (App Router) with TypeScript, Tailwind CSS, and SQLite via Prisma. Designed for fast iteration with zero-config deployment on Vercel.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** ORM with SQLite database
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

This project uses Prisma with SQLite for local development. The schema includes two example models:

- **User** - Basic user information with email and name
- **Post** - Blog posts linked to users

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

### AWS with Terraform (Recommended for Production)

Deploy to AWS using Terraform with full infrastructure as code. Includes Elastic Beanstalk, RDS PostgreSQL, S3, and more - all within AWS Free Tier limits.

**Quick Start** (15 minutes):
```bash
# Configure and deploy infrastructure
./scripts/setup-aws.sh

# Deploy application
./scripts/deploy.sh
```

**Documentation**:
- [AWS Quick Start Guide](./AWS_QUICK_START.md) - Get started in 15 minutes
- [AWS Deployment Guide](./AWS_DEPLOYMENT.md) - Comprehensive documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - SQLite to PostgreSQL migration
- [Terraform README](./terraform/README.md) - Infrastructure details

**What you get**:
- Elastic Beanstalk Node.js environment
- RDS PostgreSQL database (db.t3.micro)
- VPC with public/private subnets
- Application Load Balancer
- S3 buckets for assets
- CloudWatch monitoring
- SSM Parameter Store for secrets
- Optional: Route 53 DNS + ACM SSL certificate

**Cost**: Free for 12 months (AWS Free Tier), then ~$15-25/month

### Vercel (Alternative)

This project also supports Vercel deployment:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and configure the build settings
4. Add environment variables in Vercel dashboard (see `.env.example`)
5. Deploy

For production, use a hosted database:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [PlanetScale](https://planetscale.com/)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)

Update your `DATABASE_URL` in the Vercel environment variables accordingly.

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
