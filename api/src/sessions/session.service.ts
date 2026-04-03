import type { ISessionRepository } from './session.repository'
import type { Session, SessionInsertPayload } from './session.schema'
import { env } from '@api/env'
import { NotFoundException } from '@api/lib/errors'
import { SessionInsertSchema } from './session.schema'

export interface ISessionService {
  getSessionByHash: (refreshTokenHash: string) => Promise<Session>
  create: (data: SessionInsertPayload) => Promise<Session>
  rotateSession: (oldSession: Session, refreshTokenHash: string) => Promise<unknown>
  revokeEntireFamily: (familyId: string) => Promise<Session>
  setRevoked: (id: number) => Promise<void>
  setSessionIsUsed: (id: number) => Promise<Session>
}

/** Service for session validation and lifecycle management. */
export function createSessionService(sessionRepository: ISessionRepository): ISessionService {
  return {

    /** Finds a session by refresh token hash. */
    async getSessionByHash(refreshTokenHash: string) {
      const result = await sessionRepository.getSessionByHash(refreshTokenHash)

      if (!result)
        throw new NotFoundException('Session')

      return result
    },

    /** Creates a validated session record. */
    async create(data: SessionInsertPayload) {
      const parsedData = SessionInsertSchema.parse(data)

      const result = await sessionRepository.create(parsedData)

      return result
    },

    /** Rotates an existing session into a new one. */
    async rotateSession(oldSession: Session, refreshTokenHash: string) {
      const expiresAtMilliSeconds
        = Date.now() + env.REFRESH_TOKEN_EXPIRY * 1000
      const expiresAt = new Date(expiresAtMilliSeconds)

      const newSession: SessionInsertPayload = {
        userId: oldSession.userId,
        ipAddress: oldSession.ipAddress,
        userAgent: oldSession.userAgent,
        refreshTokenHash,
        familyId: oldSession.familyId,
        expiresAt,
      }

      const result = await sessionRepository.rotateSession(oldSession.id, newSession)

      return result
    },

    /** Revokes all sessions in a family. */
    async revokeEntireFamily(familyId: string) {
      const result = await sessionRepository.revokeEntireFamily(familyId)

      if (!result)
        throw new NotFoundException('Session')

      return result
    },

    /** Marks a session as revoked. */
    async setRevoked(id: number) {
      const result = await sessionRepository.update(id, { isRevoked: true })

      if (!result)
        throw new NotFoundException('Session')
    },

    /** Marks a session as used. */
    async setSessionIsUsed(id: number) {
      const result = await sessionRepository.update(id, { isUsed: true })

      if (!result)
        throw new NotFoundException('Session')

      return result
    },
  }
}
