import { usersTable } from '@api/users'
import { extendZodWithOpenApi, z } from '@hono/zod-openapi'
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

extendZodWithOpenApi(z)

export const sessionsTable = pgTable('sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  refreshTokenHash: text().unique().notNull(),
  isRevoked: boolean().default(false),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* zod schemas ------- */

export const SessionSelectSchema = createSelectSchema(sessionsTable)
  .openapi('Session')

export const SessionInsertSchema = createInsertSchema(sessionsTable).omit({
  createdAt: true,
  updatedAt: true,
}).openapi('SessionInsert')

export const SessionUpdateSchema = SessionInsertSchema
  .partial()
  .openapi('SessionUpdate')

/* types --------- */

export type Session = z.infer<typeof SessionSelectSchema>
export type SessionInsertPayload = z.infer<typeof SessionInsertSchema>
export type SessionUpdatePayload = z.infer<typeof SessionUpdateSchema>
