import { extendZodWithOpenApi, z } from '@hono/zod-openapi'
import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'

extendZodWithOpenApi(z)

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/* zod schemas ------- */

export const UserSelectSchema = createSelectSchema(usersTable)
  .omit({ password: true })
  .openapi('User')

export const UserInsertSchema = createSelectSchema(usersTable, {
  username: z.string().min(5).max(255).openapi({ example: 'aronald' }),
  password: z.string().min(8).max(255).openapi({ example: 'secure_password_123' }),
  firstName: z.string().min(1).max(255).openapi({ example: 'Adam' }),
  lastName: z.string().min(1).max(255).openapi({ example: 'Ronald' }),
  email: z.email().openapi({ example: 'a.ronald@example.com' }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).openapi('UserInsert')

export const UserUpdateSchema = UserInsertSchema.partial()
  .openapi('UserUpdate')

export const publicColumns = {
  id: usersTable.id,
  username: usersTable.username,
  firstName: usersTable.firstName,
  lastName: usersTable.lastName,
  email: usersTable.email,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
}

/* types --------- */

export type User = z.infer<typeof UserSelectSchema>
export type UserInsertPayload = z.infer<typeof UserInsertSchema>
export type UserUpdatePayload = z.infer<typeof UserUpdateSchema>
