import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, incomeItems, expenseItems } = body

    const convertToMonthly = (amount: number, frequency: string): number => {
      switch (frequency) {
        case 'weekly':
          return amount * 4.33
        case 'bi-weekly':
          return amount * 2.17
        case 'monthly':
          return amount
        case 'yearly':
          return amount / 12
        default:
          return amount
      }
    }

    const calculatePoints = (surplus: number): number => {
      if (surplus <= 0) return 0
      if (surplus < 100) return 10
      if (surplus < 300) return 25
      if (surplus < 500) return 50
      if (surplus < 1000) return 100
      return 200
    }

    const totalIncome = incomeItems.reduce(
      (sum: number, item: any) =>
        sum + convertToMonthly(item.amount, item.frequency),
      0
    )
    const totalExpenses = expenseItems.reduce(
      (sum: number, item: any) =>
        sum + convertToMonthly(item.amount, item.frequency),
      0
    )
    const surplus = totalIncome - totalExpenses
    const pointsEarned = calculatePoints(surplus)

    const budgetCalculation = await prisma.budgetCalculation.create({
      data: {
        userId,
        totalIncome,
        totalExpenses,
        surplus,
        pointsEarned,
        incomeItems: {
          create: incomeItems.map((item: any) => ({
            source: item.source,
            amount: item.amount,
            frequency: item.frequency,
          })),
        },
        expenseItems: {
          create: expenseItems.map((item: any) => ({
            category: item.category,
            amount: item.amount,
            frequency: item.frequency,
          })),
        },
      },
      include: {
        incomeItems: true,
        expenseItems: true,
      },
    })

    return NextResponse.json(budgetCalculation)
  } catch (error) {
    console.error('Error creating budget calculation:', error)
    return NextResponse.json(
      { error: 'Failed to create budget calculation' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const where = userId ? { userId } : {}

    const budgetCalculations = await prisma.budgetCalculation.findMany({
      where,
      include: {
        incomeItems: true,
        expenseItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    return NextResponse.json(budgetCalculations)
  } catch (error) {
    console.error('Error fetching budget calculations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget calculations' },
      { status: 500 }
    )
  }
}
