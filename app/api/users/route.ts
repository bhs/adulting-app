import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { captureException, addBreadcrumb } from '@/lib/sentry'

export async function GET() {
  try {
    addBreadcrumb({
      message: 'Fetching all users',
      category: 'api',
      level: 'info',
    })

    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    captureException(error, {
      endpoint: '/api/users',
      method: 'GET',
    })

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name } = body

    addBreadcrumb({
      message: 'Creating new user',
      category: 'api',
      level: 'info',
      data: { email, hasName: !!name },
    })

    if (!email) {
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

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    captureException(error, {
      endpoint: '/api/users',
      method: 'POST',
    })

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
