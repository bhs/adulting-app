import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordError, addSpanAttributes, withSpan } from '@/lib/otel'

export async function GET() {
  return withSpan('GET /api/users', async (span) => {
    try {
      addSpanAttributes({
        'http.method': 'GET',
        'http.route': '/api/users',
      })

      const users = await prisma.user.findMany({
        include: {
          posts: true,
        },
      })

      addSpanAttributes({
        'db.result.count': users.length,
      })

      return NextResponse.json(users)
    } catch (error) {
      recordError(error as Error, {
        'error.type': 'database_query_error',
        'http.status_code': 500,
      })

      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: Request) {
  return withSpan('POST /api/users', async (span) => {
    try {
      addSpanAttributes({
        'http.method': 'POST',
        'http.route': '/api/users',
      })

      const body = await request.json()
      const { email, name } = body

      if (!email) {
        addSpanAttributes({
          'error.type': 'validation_error',
          'validation.field': 'email',
        })

        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
        },
      })

      addSpanAttributes({
        'user.id': user.id,
        'user.email': email,
      })

      return NextResponse.json(user, { status: 201 })
    } catch (error) {
      recordError(error as Error, {
        'error.type': 'user_creation_error',
        'http.status_code': 500,
      })

      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  })
}
