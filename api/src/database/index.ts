import * as schema from '@api/database/schema'
import { env } from '@api/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })

export type DbClient = typeof db
export type DbTransaction = Parameters<Parameters<DbClient['transaction']>[0]>[0]
export type DbContext = DbClient | DbTransaction
