/**
 * Root Auth.js instance (Node runtime).
 *
 * This is the full server-side instance used by the API route handler and by
 * the login page's server actions. It layers the Prisma adapter onto the shared
 * `authConfig` so linked school accounts and users persist to the existing
 * database. Sessions use the JWT strategy: this keeps `middleware.ts` able to
 * read the session in the Edge runtime (a database lookup is not possible
 * there) while the adapter still records the User and Account rows on sign-in.
 */
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth/config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
})
