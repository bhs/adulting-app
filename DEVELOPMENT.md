# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Visit http://localhost:3000

## Development Workflow

### Making Database Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <description>`
3. Prisma Client is auto-generated

### Adding New Features

1. Create components in `/components`
2. Add routes in `/app`
3. Add API endpoints in `/app/api`
4. Use utilities from `/lib`

### Code Quality Checks

Before committing, run:

```bash
npm run lint          # Check linting
npm run type-check    # Check types
npm run format:check  # Check formatting
npm run format        # Auto-format code
```

## Common Tasks

### Adding a New API Route

Create a file at `app/api/[route-name]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Your logic here
  return NextResponse.json({ data: 'example' })
}
```

### Creating a New Page

Create a file at `app/[page-name]/page.tsx`:

```typescript
export default function PageName() {
  return (
    <main>
      <h1>Page Title</h1>
    </main>
  )
}
```

### Using the Database

```typescript
import { prisma } from '@/lib/prisma'

// Create
const user = await prisma.user.create({
  data: { email: 'user@example.com', name: 'John' }
})

// Read
const users = await prisma.user.findMany()

// Update
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane' }
})

// Delete
await prisma.user.delete({
  where: { id: userId }
})
```

## Debugging

### Database Issues

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Next.js Issues

- Check `.next/` directory exists
- Clear `.next/` folder and rebuild
- Check console for detailed error messages

## Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL` - Database connection string
- `NODE_ENV` - Environment (development/production)

## Testing the API

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Get all users
curl http://localhost:3000/api/users
```
