import type { Session, SessionInsertPayload } from './session.schema'
import { env } from '@api/env'
import { ForbiddenException, NotFoundException, UnauthenticatedException } from '@api/lib/errors'
import { SessionRepository } from './session.repository'
import { SessionInsertSchema } from './session.schema'

export const SessionService = {
  async getSessionByHash(refreshTokenHash: string) {
    const result = await SessionRepository.getSessionByHash(refreshTokenHash)

    if (!result)
      throw new NotFoundException('Session')

    return result
  },

  async checkSessionValidity(session: Session) {
    if (session.isRevoked) {
      throw new UnauthenticatedException('Session revoked')
    }

    if (new Date() <= session.expiresAt) {
      throw new UnauthenticatedException('Session expired')
    }

    if (session.isUsed) {
      await SessionRepository.revokeEntireFamily(session.familyId)
      throw new ForbiddenException('Security breach detected. All sessions revoked.')
    }
  },

  async create(data: SessionInsertPayload) {
    const parsedData = SessionInsertSchema.parse(data)

    const result = await SessionRepository.create(parsedData)

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

    const result = await SessionRepository.rotateSession(oldSession.id, newSession)

    return result
  },

  async setRevoked(id: number) {
    const result = await SessionRepository.update(id, { isRevoked: true })

    if (!result)
      throw new NotFoundException('Session')
  },

  async setSessionIsUsed(id: number) {
    const result = await SessionRepository.update(id, { isUsed: true })

    if (!result)
      throw new NotFoundException('Session')

    return result
  },
}
