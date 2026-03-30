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

  async getById(id: number): Promise<Session | undefined> {
    const [result] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))

    return result
  },

  async getSessionByHash(hash: string): Promise<Session | undefined> {
    const [result] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.refreshTokenHash, hash))

    return result
  },

  async rotateSession(oldSessionId: number, newSessionData: SessionInsertPayload) {
    return await db.transaction(async (tx) => {
      await tx.update(sessionsTable)
        .set({ isUsed: true })
        .where(eq(sessionsTable.id, oldSessionId))

      return await tx.insert(sessionsTable).values({
        userId: newSessionData.userId,
        refreshTokenHash: newSessionData.refreshTokenHash,
        familyId: newSessionData.familyId,
        userAgent: newSessionData.userAgent,
        ipAddress: newSessionData.ipAddress,
        expiresAt: newSessionData.expiresAt,
      })
    })
  },

  async revokeEntireFamily(familyId: string): Promise<Session | undefined> {
    const [result] = await db
      .update(sessionsTable)
      .set({ isRevoked: true })
      .where(eq(sessionsTable.familyId, familyId))
      .returning()

    return result
  },

  async create(data: SessionInsertPayload): Promise<Session | undefined> {
    const [result] = await db
      .insert(sessionsTable)
      .values({ ...data })
      .returning()

    return result
  },

  async update(id: number, data: SessionUpdatePayload): Promise<Session | undefined> {
    const [result] = await db
      .update(sessionsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sessionsTable.id, id))
      .returning()

    return result
  },

  async delete(id: number): Promise<Session | undefined> {
    const [result] = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .returning()

    return result
  },
}
