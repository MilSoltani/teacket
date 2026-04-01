import { usersTable } from '@api/users/user.schema'
import { extendZodWithOpenApi, z } from '@hono/zod-openapi'
import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

extendZodWithOpenApi(z)

export const sessionsTable = pgTable('sessions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  ipAddress: varchar({ length: 50 }),
  userAgent: varchar({ length: 255 }),
  refreshTokenHash: text().unique().notNull(),
  familyId: uuid().notNull(),
  isUsed: boolean().default(false),
  isRevoked: boolean().default(false),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/* zod schemas ------- */

export const SessionSelectSchema = createSelectSchema(sessionsTable)
  .openapi('Session')

export const SessionInsertSchema = createInsertSchema(sessionsTable).omit({
  createdAt: true,
  updatedAt: true,
}).strict().openapi('SessionInsert')

export const SessionUpdateSchema = SessionInsertSchema
  .partial()
  .openapi('SessionUpdate')

export const SessionBaseSchema = SessionSelectSchema.omit({
  userId: true,
  refreshTokenHash: true,
  createdAt: true,
  updatedAt: true,
})

/* types ---------- */

export type Session = z.infer<typeof SessionSelectSchema>
export type SessionInsertPayload = z.infer<typeof SessionInsertSchema>
export type SessionUpdatePayload = z.infer<typeof SessionUpdateSchema>
export type SessionBase = z.infer<typeof SessionBaseSchema>
