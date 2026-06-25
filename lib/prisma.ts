import { PrismaClient } from '@prisma/client'
import { trace, SpanStatusCode } from '@opentelemetry/api'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const tracer = trace.getTracer('adulting-app-prisma', '1.0.0')

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

// Add OpenTelemetry middleware for Prisma queries
prisma.$use(async (params, next) => {
  return tracer.startActiveSpan(
    `prisma.${params.model}.${params.action}`,
    async (span) => {
      try {
        // Add query attributes
        span.setAttribute('db.system', 'postgresql')
        span.setAttribute('db.operation', params.action)
        if (params.model) {
          span.setAttribute('db.model', params.model)
        }

        // Execute the query
        const result = await next(params)

        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Database error',
        })
        span.recordException(error as Error)
        throw error
      } finally {
        span.end()
      }
    }
  )
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
