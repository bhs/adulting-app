/**
 * @jest-environment node
 *
 * Migration test for 20260725_add_auth_tables.
 *
 * Migrations are high-risk, so this exercises the real up and down SQL against a
 * live PostgreSQL instance and verifies three things: the up migration creates
 * the Auth.js tables and columns, the down migration cleanly reverts them, and
 * the down migration preserves unrelated pre-existing data (User and Post rows).
 *
 * It requires a database and therefore runs only when DATABASE_URL is set — the
 * Docker test stack (.mendel/docker-compose.test.yml) provides one. On a plain
 * `npm test` with no database the whole suite is skipped so local runs stay
 * green. The migrations are applied inside a throwaway schema so nothing else in
 * the database is touched.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL
const TEST_SCHEMA = 'auth_migration_test'

const initSql = readFileSync(
  resolve(__dirname, '../20260622_init/migration.sql'),
  'utf8'
)
const upSql = readFileSync(
  resolve(__dirname, '../20260725_add_auth_tables/migration.sql'),
  'utf8'
)
const downSql = readFileSync(
  resolve(__dirname, '../20260725_add_auth_tables/down.sql'),
  'utf8'
)

// Skip the whole suite when there is no database to run against.
const describeWithDb = DATABASE_URL ? describe : describe.skip

describeWithDb('20260725_add_auth_tables migration', () => {
  let client: Client

  beforeAll(async () => {
    client = new Client({ connectionString: DATABASE_URL })
    await client.connect()
    // Isolate everything in a throwaway schema on a clean slate.
    await client.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`)
    await client.query(`CREATE SCHEMA "${TEST_SCHEMA}"`)
    await client.query(`SET search_path TO "${TEST_SCHEMA}"`)
    // Baseline: the pre-existing schema the new migration builds on top of.
    await client.query(initSql)
  })

  afterAll(async () => {
    if (client) {
      await client.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`)
      await client.end()
    }
  })

  const columnExists = async (table: string, column: string) => {
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      [TEST_SCHEMA, table, column]
    )
    return rows.length > 0
  }

  const tableExists = async (table: string) => {
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = $2`,
      [TEST_SCHEMA, table]
    )
    return rows.length > 0
  }

  it('applies the up migration: creates auth tables and extends User', async () => {
    // Seed unrelated data before migrating so we can prove it survives later.
    await client.query(
      `INSERT INTO "User" ("id", "email", "name", "updatedAt")
       VALUES ('u-seed', 'seed@school.edu', 'Seed', NOW())`
    )
    await client.query(
      `INSERT INTO "Post" ("id", "title", "authorId", "updatedAt")
       VALUES ('p-seed', 'Hello', 'u-seed', NOW())`
    )

    await client.query(upSql)

    expect(await tableExists('Account')).toBe(true)
    expect(await tableExists('Session')).toBe(true)
    expect(await tableExists('VerificationToken')).toBe(true)
    expect(await columnExists('User', 'emailVerified')).toBe(true)
    expect(await columnExists('User', 'image')).toBe(true)

    // The Account -> User foreign key works with the seeded user.
    await client.query(
      `INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId")
       VALUES ('a-seed', 'u-seed', 'oidc', 'google', 'google-sub-1')`
    )
    const linked = await client.query(
      `SELECT "provider" FROM "Account" WHERE "userId" = 'u-seed'`
    )
    expect(linked.rows[0].provider).toBe('google')
  })

  it('applies the down migration: reverts the schema changes', async () => {
    await client.query(downSql)

    expect(await tableExists('Account')).toBe(false)
    expect(await tableExists('Session')).toBe(false)
    expect(await tableExists('VerificationToken')).toBe(false)
    expect(await columnExists('User', 'emailVerified')).toBe(false)
    expect(await columnExists('User', 'image')).toBe(false)
  })

  it('preserves unrelated data through the down migration', async () => {
    const user = await client.query(
      `SELECT "email", "name" FROM "User" WHERE "id" = 'u-seed'`
    )
    const post = await client.query(
      `SELECT "title" FROM "Post" WHERE "id" = 'p-seed'`
    )

    expect(user.rows).toHaveLength(1)
    expect(user.rows[0].email).toBe('seed@school.edu')
    expect(post.rows).toHaveLength(1)
    expect(post.rows[0].title).toBe('Hello')
  })
})
