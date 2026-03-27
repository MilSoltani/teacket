import path from 'node:path'
import * as schema from '@api/database/schema'
import { PGlite } from '@electric-sql/pglite'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterAll, beforeAll, beforeEach, expect, vi } from 'vitest'

vi.mock('@api/../env', () => ({
  env: {
    DATABASE_URL: 'memory://test',
    NODE_ENV: 'local',
  },
}))

let testClient: PGlite
let db: any

vi.mock('@api/database', async (importOriginal) => {
  testClient = new PGlite()
  db = drizzle(testClient, { schema })
  return {
    ...(await importOriginal<typeof import('@api/database')>()),
    db,
  }
})

const isIntegrationTest = () => expect.getState().testPath?.endsWith('.int.test.ts')

beforeAll(async () => {
  if (!isIntegrationTest())
    return

  const migrationsFolder = path.resolve(__dirname, './drizzle')
  await migrate(db, { migrationsFolder })
})

beforeEach(async () => {
  if (!isIntegrationTest())
    return

  const tables = await db.execute(sql`
    select tablename from pg_tables 
    where schemaname = 'public' 
    and tablename not like '__drizzle_migrations%'
  `)

  for (const { tablename } of tables.rows as Array<{ tablename: string }>) {
    await db.execute(sql.raw(`truncate table "${tablename}" cascade`))
  }
})

afterAll(async () => {
  if (testClient)
    await testClient.close()
})
