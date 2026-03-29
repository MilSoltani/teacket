import path from 'node:path'
import * as schema from '@api/database/schema'
import { PGlite } from '@electric-sql/pglite'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterAll, beforeAll, beforeEach, vi } from 'vitest'

vi.mock('@api/env', () => ({
  env: {
    DATABASE_URL: 'memory://test',
    NODE_ENV: 'local',
  },
}))

const sharedState = vi.hoisted(() => ({
  testClient: null as unknown as PGlite,
  db: null as any,
}))

vi.mock('@api/database', async (importOriginal) => {
  const original = await importOriginal<typeof import('@api/database')>()

  return {
    ...original,
    get db() {
      return sharedState.db
    },
  }
})

sharedState.testClient = new PGlite()
sharedState.db = drizzle(sharedState.testClient, { schema })

beforeAll(async () => {
  const migrationsFolder = path.resolve(__dirname, './drizzle')
  await migrate(sharedState.db, { migrationsFolder })
})

beforeEach(async () => {
  const tables = await sharedState.db.execute(sql`
    select tablename from pg_tables 
    where schemaname = 'public' 
    and tablename not like '__drizzle_migrations%'
  `)

  for (const { tablename } of tables.rows as Array<{ tablename: string }>) {
    await sharedState.db.execute(sql.raw(`truncate table "${tablename}" cascade`))
  }
})

afterAll(async () => {
  if (sharedState.testClient) {
    await sharedState.testClient.close()
  }
})
