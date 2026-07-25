/**
 * Edge-runtime Auth.js instance for `middleware.ts`.
 *
 * The middleware runs in the Edge runtime, where the Prisma adapter cannot run,
 * so this instance is built from the adapter-free `authConfig` alone. It only
 * needs to read the session (a signed JWT cookie) to gate requests — it never
 * writes to the database. The Node-side route handler in the root `auth.ts`
 * adds the Prisma adapter for the parts of the flow that persist accounts.
 */
import NextAuth from 'next-auth'
import { authConfig } from './config'

export const { auth } = NextAuth(authConfig)
