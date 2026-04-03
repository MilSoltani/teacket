import type { SessionRepository } from './session.repository'
import type { Session, SessionInsertPayload } from './session.schema'
import { env } from '@api/env'
import { NotFoundException } from '@api/lib/errors'
import { SessionInsertSchema } from './session.schema'

export function SessionService(sessionRepository: typeof SessionRepository) {
  return {
    async getSessionByHash(refreshTokenHash: string) {
      const result = await sessionRepository.getSessionByHash(refreshTokenHash)

      if (!result)
        throw new NotFoundException('Session')

      return result
    },

    async create(data: SessionInsertPayload) {
      const parsedData = SessionInsertSchema.parse(data)

      const result = await sessionRepository.create(parsedData)

      return result
    },

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

    async setRevoked(id: number) {
      const result = await sessionRepository.update(id, { isRevoked: true })

      if (!result)
        throw new NotFoundException('Session')
    },

    async setSessionIsUsed(id: number) {
      const result = await sessionRepository.update(id, { isUsed: true })

      if (!result)
        throw new NotFoundException('Session')

      return result
    },
  }
}
