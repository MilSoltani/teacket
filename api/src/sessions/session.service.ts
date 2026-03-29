import { env } from '@api/env'
import { NotFoundException } from '@api/lib/errors'
import { SessionRepository } from './session.repository'

export const SessionService = {
  async getById(id: string) {
    const result = await SessionRepository.getById(id)

    if (!result)
      throw new NotFoundException('Session')

    return result
  },

  async create(id: string, userId: number, refreshTokenHash: string, userAgent: string | undefined, ipAddress: string | undefined) {
    const expiresAtMilliSeconds
      = Date.now() + env.REFRESH_TOKEN_EXPIRY * 1000
    const expiresAt = new Date(expiresAtMilliSeconds)

    const result = await SessionRepository.create({
      id,
      userId,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    })

    return result
  },

  async updateRefreshToken(id: string, refreshTokenHash: string) {
    const result = await SessionRepository.update(id, { refreshTokenHash })

    if (!result)
      throw new NotFoundException('Session')

    return result
  },

  async revoke(id: string) {
    const result = await SessionRepository.update(id, { isRevoked: true })

    if (!result)
      throw new NotFoundException('Session')
  },
}
