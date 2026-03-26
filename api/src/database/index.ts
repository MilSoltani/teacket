import * as schema from '@api/database/schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from 'env'
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
