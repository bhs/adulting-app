import { describe, it, expect } from '@jest/globals'
import {
  googleCredentials,
  entraCredentials,
  entraIssuer,
  configuredProviderIds,
  SSO_PROVIDERS,
} from '../providers'

const GOOGLE_ENV = {
  GOOGLE_CLIENT_ID: 'g-id',
  GOOGLE_CLIENT_SECRET: 'g-secret',
}

const ENTRA_ENV = {
  AZURE_AD_CLIENT_ID: 'az-id',
  AZURE_AD_CLIENT_SECRET: 'az-secret',
  AZURE_AD_TENANT_ID: 'tenant-123',
}

describe('entraIssuer', () => {
  it('builds the tenant-scoped v2.0 issuer URL', () => {
    expect(entraIssuer('tenant-123')).toBe(
      'https://login.microsoftonline.com/tenant-123/v2.0'
    )
  })
})

describe('googleCredentials', () => {
  it('returns the client id and secret when both are set', () => {
    expect(googleCredentials(GOOGLE_ENV)).toEqual({
      clientId: 'g-id',
      clientSecret: 'g-secret',
    })
  })

  it('returns null when the id or secret is missing', () => {
    expect(googleCredentials({ GOOGLE_CLIENT_ID: 'g-id' })).toBeNull()
    expect(googleCredentials({ GOOGLE_CLIENT_SECRET: 'g-secret' })).toBeNull()
    expect(googleCredentials({})).toBeNull()
  })
})

describe('entraCredentials', () => {
  it('returns credentials with a tenant-scoped issuer when fully configured', () => {
    expect(entraCredentials(ENTRA_ENV)).toEqual({
      clientId: 'az-id',
      clientSecret: 'az-secret',
      issuer: 'https://login.microsoftonline.com/tenant-123/v2.0',
    })
  })

  it('returns null when any of id, secret, or tenant is missing', () => {
    const { AZURE_AD_TENANT_ID, ...noTenant } = ENTRA_ENV
    expect(entraCredentials(noTenant)).toBeNull()
    expect(entraCredentials({ AZURE_AD_CLIENT_ID: 'az-id' })).toBeNull()
    expect(entraCredentials({})).toBeNull()
  })
})

describe('configuredProviderIds', () => {
  it('lists only the providers whose credentials are present', () => {
    expect(configuredProviderIds({ ...GOOGLE_ENV, ...ENTRA_ENV })).toEqual([
      'google',
      'microsoft-entra-id',
    ])
    expect(configuredProviderIds(GOOGLE_ENV)).toEqual(['google'])
    expect(configuredProviderIds(ENTRA_ENV)).toEqual(['microsoft-entra-id'])
    expect(configuredProviderIds({})).toEqual([])
  })
})

describe('SSO_PROVIDERS', () => {
  it('offers a Google and a Microsoft button with stable ids', () => {
    expect(SSO_PROVIDERS.map((p) => p.id)).toEqual([
      'google',
      'microsoft-entra-id',
    ])
    expect(SSO_PROVIDERS.map((p) => p.label)).toEqual([
      'Sign in with Google',
      'Sign in with Microsoft',
    ])
  })
})
