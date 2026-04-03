import type { DbClient, DbContext } from '@api/database'
import type { Session, SessionInsertPayload, SessionUpdatePayload } from './session.schema'
import { eq } from 'drizzle-orm'
import { sessionsTable } from './session.schema'

export interface ISessionRepository {
  getAll: (dbContext?: DbContext) => Promise<Session[]>
  getById: (id: number, dbContext?: DbContext) => Promise<Session | undefined>
  getSessionByHash: (hash: string, dbContext?: DbContext) => Promise<Session | undefined>
  rotateSession: (oldSessionId: number, newSessionData: SessionInsertPayload, dbContext?: DbContext) => Promise<unknown>
  revokeEntireFamily: (familyId: string, dbContext?: DbContext) => Promise<Session | undefined>
  create: (data: SessionInsertPayload, dbContext?: DbContext) => Promise<Session>
  update: (id: number, data: SessionUpdatePayload, dbContext?: DbContext) => Promise<Session | undefined>
  delete: (id: number, dbContext?: DbContext) => Promise<Session | undefined>
}

function hasTransaction(context: DbContext): context is DbClient {
  return typeof (context as DbClient).transaction === 'function'
}

export function createSessionRepository(dbClient: DbClient): ISessionRepository {
  return {
    async getAll(dbContext: DbContext = dbClient): Promise<Session[]> {
      const result = await dbContext
        .select()
        .from(sessionsTable)

      return result
    },

    async getById(id: number, dbContext: DbContext = dbClient): Promise<Session | undefined> {
      const [result] = await dbContext
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.id, id))

      return result
    },

    async getSessionByHash(hash: string, dbContext: DbContext = dbClient): Promise<Session | undefined> {
      const [result] = await dbContext
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.refreshTokenHash, hash))

      return result
    },

    async rotateSession(oldSessionId: number, newSessionData: SessionInsertPayload, dbContext: DbContext = dbClient) {
      const rotate = async (ctx: DbContext) => {
        await ctx.update(sessionsTable)
          .set({ isUsed: true })
          .where(eq(sessionsTable.id, oldSessionId))

        return await ctx.insert(sessionsTable).values({
          userId: newSessionData.userId,
          refreshTokenHash: newSessionData.refreshTokenHash,
          familyId: newSessionData.familyId,
          userAgent: newSessionData.userAgent,
          ipAddress: newSessionData.ipAddress,
          expiresAt: newSessionData.expiresAt,
        })
      }

      if (hasTransaction(dbContext)) {
        return await dbContext.transaction(async tx => rotate(tx))
      }

      return await rotate(dbContext)
    },

    async revokeEntireFamily(familyId: string, dbContext: DbContext = dbClient): Promise<Session | undefined> {
      const [result] = await dbContext
        .update(sessionsTable)
        .set({ isRevoked: true })
        .where(eq(sessionsTable.familyId, familyId))
        .returning()

      return result
    },

    async create(data: SessionInsertPayload, dbContext: DbContext = dbClient): Promise<Session> {
      const [result] = await dbContext
        .insert(sessionsTable)
        .values({ ...data })
        .returning()

      return result
    },

    async update(id: number, data: SessionUpdatePayload, dbContext: DbContext = dbClient): Promise<Session | undefined> {
      const [result] = await dbContext
        .update(sessionsTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sessionsTable.id, id))
        .returning()

      return result
    },

    async delete(id: number, dbContext: DbContext = dbClient): Promise<Session | undefined> {
      const [result] = await dbContext
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, id))
        .returning()

      return result
    },
  }
}
