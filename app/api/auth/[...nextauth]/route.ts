/**
 * Auth.js catch-all route handler.
 *
 * Exposes the OAuth/OIDC endpoints (sign-in, callback, sign-out, session, CSRF)
 * that the Google Workspace and Microsoft Entra ID flows redirect through.
 */
import { handlers } from '@/auth'

export const { GET, POST } = handlers
