import { NextResponse } from 'next/server'

/**
 * Lightweight health-check endpoint used by container orchestration and the
 * demo harness to know when the app is ready to serve traffic.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
