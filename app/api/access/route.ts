import { NextResponse } from 'next/server'
import { checkAccess } from '@/lib/soft-launch/allowlist'

/**
 * Soft-launch access check.
 *
 * The production launch is gated to a cohort defined by the
 * `SOFT_LAUNCH_ALLOWLIST` env var (provisioned by the Render Terraform module).
 * The frontend hits this endpoint to decide whether to admit a signed-in email
 * into the soft-launched experience.
 *
 * `GET /api/access?email=alice@example.com` → `{ email, allowed, mode }`
 *
 * The response deliberately never echoes the allow-list itself — only the
 * decision and the coarse launch `mode` (open/restricted/closed) — so the
 * cohort membership is not leaked to clients.
 */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email')
  const decision = checkAccess(email)
  return NextResponse.json(decision)
}

/**
 * `POST /api/access` with a JSON body `{ "email": "alice@example.com" }`.
 * Behaves like GET but keeps the email out of server logs / URLs, which is the
 * preferred path for the sign-in flow.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email : null
    return NextResponse.json(checkAccess(email))
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
