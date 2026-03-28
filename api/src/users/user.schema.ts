import { extendZodWithOpenApi, z } from '@hono/zod-openapi'
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

extendZodWithOpenApi(z)

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* zod schemas ------- */

export const UserSelectSchema = createSelectSchema(usersTable)
  .omit({ password: true })
  .strict()
  .openapi('User')

export const UserInsertSchema = createInsertSchema(usersTable, {
  username: z.string().min(5).max(255),
  email: z.email().min(5).max(255),
}).omit({
  password: true,
  createdAt: true,
  updatedAt: true,
}).strict().openapi('UserInsert')

export const UserUpdateSchema = UserInsertSchema
  .partial()
  .openapi('UserUpdate')

export const publicColumns = {
  id: usersTable.id,
  username: usersTable.username,
  email: usersTable.email,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
}

export const UserBaseSchema = UserSelectSchema.omit({
  email: true,
  createdAt: true,
  updatedAt: true,
})

/* types --------- */

export type User = z.infer<typeof UserSelectSchema>
export type UserInsertPayload = z.infer<typeof UserInsertSchema>
export type UserUpdatePayload = z.infer<typeof UserUpdateSchema>
export type UserBase = z.infer<typeof UserBaseSchema>
