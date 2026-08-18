import { describe, it, expect } from '@jest/globals'
import {
  isPublicPath,
  resolveAccess,
  SOFT_LAUNCH_FORBIDDEN_MESSAGE,
} from '../access'

describe('isPublicPath', () => {
  it('treats the login page, auth endpoints, and health check as public', () => {
    expect(isPublicPath('/login')).toBe(true)
    expect(isPublicPath('/api/auth/signin/google')).toBe(true)
    expect(isPublicPath('/api/auth/callback/microsoft-entra-id')).toBe(true)
    expect(isPublicPath('/api/health')).toBe(true)
  })

  it('treats app routes as protected', () => {
    expect(isPublicPath('/')).toBe(false)
    expect(isPublicPath('/api/users')).toBe(false)
    // A path that merely starts with the same letters is not public.
    expect(isPublicPath('/loginhelp')).toBe(false)
  })
})

describe('resolveAccess', () => {
  const allowlist = ['teacher@school.edu']

  it('allows public paths regardless of authentication', () => {
    expect(
      resolveAccess({
        pathname: '/login',
        isAuthenticated: false,
        allowlist,
      })
    ).toEqual({ type: 'allow' })
  })

  it('redirects unauthenticated visitors on a protected path to /login', () => {
    expect(
      resolveAccess({
        pathname: '/',
        isAuthenticated: false,
        allowlist: [],
      })
    ).toEqual({ type: 'redirect', to: '/login' })
  })

  it('forbids an authenticated user whose email is off the soft-launch list', () => {
    expect(
      resolveAccess({
        pathname: '/',
        isAuthenticated: true,
        email: 'stranger@elsewhere.com',
        allowlist,
      })
    ).toEqual({ type: 'forbid', reason: SOFT_LAUNCH_FORBIDDEN_MESSAGE })
  })

  it('allows an authenticated user on the soft-launch list', () => {
    expect(
      resolveAccess({
        pathname: '/',
        isAuthenticated: true,
        email: 'teacher@school.edu',
        allowlist,
      })
    ).toEqual({ type: 'allow' })
  })

  it('allows any authenticated user when the soft-launch gate is disabled', () => {
    expect(
      resolveAccess({
        pathname: '/',
        isAuthenticated: true,
        email: 'anyone@anywhere.com',
        allowlist: [],
      })
    ).toEqual({ type: 'allow' })
  })
})
