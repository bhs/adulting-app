# Dockerfile for Next.js application on Render
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager. The Prisma schema
# is copied first because package.json's `postinstall` runs `prisma generate`,
# which needs the schema present during `npm ci`.
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Test image: reuses the full dependency set (including devDependencies such as
# Jest) plus the source tree, and stays alive so Mendel can `exec npm test`.
# This stage is only built when explicitly targeted (see
# .mendel/docker-compose.test.yml); the production `runner` build never touches
# it. The suite is pure unit/jsdom tests, so no database service is required.
FROM base AS test
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NODE_ENV=test
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["sleep", "infinity"]

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
# This will create the .next folder
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Ensure the nextjs user owns the files
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run database migrations and start the app
CMD npx prisma migrate deploy && node server.js
