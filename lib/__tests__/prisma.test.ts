import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Track how many times the PrismaClient constructor is invoked so we can
// assert the module reuses a single instance.
const constructorSpy = jest.fn()

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation((...args: unknown[]) => {
    constructorSpy(...args)
    return { $connect: jest.fn(), $disconnect: jest.fn() }
  }),
}))

// NODE_ENV is typed as a read-only literal union, so assign through a cast.
function setNodeEnv(value: string | undefined) {
  ;(process.env as Record<string, string | undefined>).NODE_ENV = value
}

describe('prisma client singleton', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.resetModules()
    constructorSpy.mockClear()
    // The singleton is cached on globalThis; clear it between tests.
    delete (globalThis as { prisma?: unknown }).prisma
  })

  afterEach(() => {
    setNodeEnv(originalNodeEnv)
    delete (globalThis as { prisma?: unknown }).prisma
  })

  it('exports an instantiated prisma client', async () => {
    const { prisma } = await import('../prisma')
    expect(prisma).toBeDefined()
    expect(constructorSpy).toHaveBeenCalledTimes(1)
    expect(constructorSpy).toHaveBeenCalledWith({ log: ['query'] })
  })

  it('caches the client on globalThis outside production', async () => {
    setNodeEnv('development')
    const { prisma } = await import('../prisma')
    expect((globalThis as { prisma?: unknown }).prisma).toBe(prisma)
  })

  it('does not cache the client on globalThis in production', async () => {
    setNodeEnv('production')
    await import('../prisma')
    expect((globalThis as { prisma?: unknown }).prisma).toBeUndefined()
  })

  it('reuses an existing global client instead of creating a new one', async () => {
    const existing = { existing: true }
    ;(globalThis as { prisma?: unknown }).prisma = existing
    const { prisma } = await import('../prisma')
    expect(prisma).toBe(existing)
    expect(constructorSpy).not.toHaveBeenCalled()
  })
})
