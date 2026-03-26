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

export const UserSelectSchema = createSelectSchema(usersTable)
  .omit({ password: true })
  .openapi('User')

export const UserInsertSchema = createSelectSchema(usersTable, {
  username: s =>
    s.min(5).max(255).openapi({ example: 'aronald' }),
  password: s =>
    s.min(8).max(255).openapi({ example: 'secure_password_123' }),
  firstName: s =>
    s.min(1).max(255).openapi({ example: 'Adam' }),
  lastName: s =>
    s.min(1).max(255).openapi({ example: 'Ronald' }),
  email: s =>
    s.email().openapi({ example: 'a.ronald@example.com' }),
}).omit({
  createdAt: true,
  updatedAt: true,
}).openapi('UserInsert')

export const UserUpdateSchema = UserInsertSchema.extend({
  password: (s: any) => s.min(8).max(255).openapi({ example: 'secure_password_123' }),
}).openapi('UserUpdate')
