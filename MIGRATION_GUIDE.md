# Migration Guide: SQLite to PostgreSQL

This guide helps you migrate from SQLite (local development) to PostgreSQL (AWS production).

## Overview

The application uses:
- **SQLite** for local development (file-based, no server needed)
- **PostgreSQL** for production on AWS (managed by RDS)

Both databases use the same Prisma schema, ensuring consistency across environments.

## Prerequisites

- Terraform infrastructure deployed (see [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md))
- Database password from SSM Parameter Store
- PostgreSQL client tools (optional, for manual operations)

## Automatic Migration (Recommended)

The deployment process automatically handles migrations using `.ebextensions/03_node_setup.config`:

```yaml
container_commands:
  03_run_migrations:
    command: "npx prisma migrate deploy"
```

This runs during each deployment, applying any pending migrations.

## Manual Migration

If you need to run migrations manually:

### Step 1: Get Database Connection String

```bash
cd terraform

# Get the full DATABASE_URL from SSM
aws ssm get-parameter \
  --name $(terraform output -raw database_password_ssm | sed 's/DB_PASSWORD/DATABASE_URL/') \
  --with-decryption \
  --query Parameter.Value \
  --output text

# Or construct it from components
DB_HOST=$(terraform output -raw database_endpoint | cut -d: -f1)
DB_PASSWORD=$(aws ssm get-parameter \
  --name $(terraform output -raw database_password_ssm) \
  --with-decryption \
  --query Parameter.Value \
  --output text)

DATABASE_URL="postgresql://dbadmin:${DB_PASSWORD}@${DB_HOST}:5432/nextjsdb"
```

### Step 2: Update Local Schema (if needed)

If switching from SQLite to PostgreSQL for testing:

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma

# Update to PostgreSQL
cp prisma/schema.production.prisma prisma/schema.prisma
```

### Step 3: Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://dbadmin:password@host:5432/nextjsdb"

# Generate Prisma Client for PostgreSQL
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or create a new migration
npx prisma migrate dev --name descriptive_name
```

## Database Differences

### SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Data Types | Limited | Rich type system |
| `@default(cuid())` | ✅ Supported | ✅ Supported |
| `@default(uuid())` | ✅ Supported | ✅ Supported |
| JSON fields | ✅ TEXT | ✅ Native JSONB |
| Full-text search | Basic | Advanced |
| Concurrent writes | Limited | Excellent |
| Max DB size | ~281 TB | Unlimited |

### Schema Compatibility

The current schema is compatible with both databases:

```prisma
// Works with both SQLite and PostgreSQL
model User {
  id        String   @id @default(cuid())  // ✅ Both
  email     String   @unique               // ✅ Both
  createdAt DateTime @default(now())       // ✅ Both
  updatedAt DateTime @updatedAt            // ✅ Both
}
```

## Data Migration

### Export from SQLite

```bash
# Export to SQL
sqlite3 prisma/dev.db .dump > backup.sql

# Export to JSON (using Prisma Studio or custom script)
npx prisma studio
```

### Import to PostgreSQL

```bash
# Using psql
psql $DATABASE_URL < backup.sql

# Using Prisma (create a migration script)
# See scripts/migrate-data.ts example below
```

### Example Data Migration Script

Create `scripts/migrate-data.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrate() {
  console.log('Starting migration...')

  // Migrate users
  const users = await sqlite.user.findMany()
  console.log(`Migrating ${users.length} users...`)

  for (const user of users) {
    await postgres.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    })
  }

  // Migrate posts
  const posts = await sqlite.post.findMany()
  console.log(`Migrating ${posts.length} posts...`)

  for (const post of posts) {
    await postgres.post.upsert({
      where: { id: post.id },
      update: post,
      create: post
    })
  }

  console.log('Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(async () => {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  })
```

Run it:

```bash
DATABASE_URL="postgresql://..." npx ts-node scripts/migrate-data.ts
```

## Environment-Specific Configuration

### Development (.env.local)

```bash
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### Production (AWS SSM)

Environment variables are stored in SSM Parameter Store:
- `/nextjs-app/DATABASE_URL`
- `/nextjs-app/NODE_ENV`
- etc.

## Testing PostgreSQL Locally

Use Docker to test with PostgreSQL locally:

```bash
# Start PostgreSQL container
docker run -d \
  --name nextjs-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nextjsdb \
  -p 5432:5432 \
  postgres:15

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextjsdb"

# Run migrations
npx prisma migrate dev

# Test the app
npm run dev
```

Stop and remove when done:

```bash
docker stop nextjs-postgres
docker rm nextjs-postgres
```

## Troubleshooting

### Connection Refused

```bash
# Verify RDS endpoint is accessible
nc -zv <rds-endpoint> 5432

# Check security group rules
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=nextjs-app-rds-sg
```

### SSL/TLS Issues

PostgreSQL on RDS requires SSL. Update connection string:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Migration Conflicts

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually
npx prisma migrate resolve --rolled-back "migration_name"
npx prisma migrate deploy
```

### Schema Drift

```bash
# Check for drift
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource $DATABASE_URL

# Create migration to fix drift
npx prisma migrate dev --name fix_drift
```

## Best Practices

1. **Always use migrations** - Don't modify the database manually
2. **Test locally first** - Use Docker to test PostgreSQL migrations
3. **Backup before migrations** - Create RDS snapshot before major changes
4. **Use shadow database** - For development, Prisma needs a shadow DB
5. **Version control migrations** - Commit migration files to git

## Creating RDS Snapshots

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier nextjs-app-db \
  --db-snapshot-identifier nextjs-app-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier nextjs-app-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier nextjs-app-db-restored \
  --db-snapshot-identifier nextjs-app-backup-20240101
```

## Useful Commands

```bash
# Connect to production database
psql $DATABASE_URL

# Show tables
\dt

# Describe table
\d "User"

# Run query
SELECT * FROM "User";

# Exit
\q
```

## Database Performance

### Indexes

Add indexes for frequently queried fields:

```prisma
model User {
  email String @unique // Already indexed
  name  String? @index // Add index
}
```

### Connection Pooling

For production, consider using connection pooling:

```bash
# Install pg-pool
npm install pg

# Update DATABASE_URL with pool settings
postgresql://user:pass@host:5432/db?connection_limit=5
```

## Related Documentation

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL on RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [AWS Deployment Guide](./AWS_DEPLOYMENT.md)
