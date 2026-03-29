import type { Session, SessionInsertPayload, SessionUpdatePayload } from './session.schema'
import { db } from '@api/database'
import { eq } from 'drizzle-orm'
import { sessionsTable } from './session.schema'

export const SessionRepository = {
  async getAll(): Promise<Session[]> {
    const result = await db
      .select()
      .from(sessionsTable)

    return result
  },

  async getById(id: string): Promise<Session | undefined> {
    const [result] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))

    return result
  },

  async create(data: SessionInsertPayload): Promise<Session | undefined> {
    const [result] = await db
      .insert(sessionsTable)
      .values({ ...data })
      .returning()

    return result
  },

  async update(id: string, data: SessionUpdatePayload): Promise<Session | undefined> {
    const [result] = await db
      .update(sessionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sessionsTable.id, id))
      .returning()

    return result
  },

  async delete(id: string): Promise<Session | undefined> {
    const [result] = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .returning()

    return result
  },
}
