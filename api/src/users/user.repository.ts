import type { User, UserInsertPayload, UserUpdatePayload } from './user.schema'
import { db } from '@api/database'
import { eq } from 'drizzle-orm'
import { publicColumns, usersTable } from './user.schema'

export const UserRepository = {
  async getAll(): Promise<User[]> {
    const result = await db
      .select(publicColumns)
      .from(usersTable)

    return result
  },

  async getById(id: number): Promise<User | undefined> {
    const [result] = await db
      .select(publicColumns)
      .from(usersTable)
      .where(eq(usersTable.id, id))

    return result
  },

  async create(data: UserInsertPayload): Promise<User | undefined> {
    const [result] = await db
      .insert(usersTable)
      .values(data)
      .returning(publicColumns)

    return result
  },

  async update(id: number, data: UserUpdatePayload): Promise<User | undefined> {
    const [result] = await db
      .update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning(publicColumns)

    return result
  },

  async delete(id: number): Promise<User | undefined> {
    const [result] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning(publicColumns)

    return result
  },
}
