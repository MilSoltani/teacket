import { env } from '@api/../env'
import { NotFoundException } from '@api/lib/errors'
import { SessionRepository } from './session.repository'

export const SessionService = {
  async getById(id: number) {
    const result = await SessionRepository.getById(id)

    if (!result)
      throw new NotFoundException('Session')

    return result
  },

  async create(userId: number, refreshTokenHash: string) {
    const expiresAtMilliSeconds
      = Date.now() + env.REFRESH_TOKEN_EXPIRY * 1000
    const expiresAt = new Date(expiresAtMilliSeconds)

    const result = await SessionRepository.create({
      userId,
      refreshTokenHash,
      expiresAt,
    })

    return result
  },

  async updateRefreshToken(id: number, refreshTokenHash: string) {
    const result = await SessionRepository.update(id, { refreshTokenHash })

    if (!result)
      throw new NotFoundException('Session')

    return result
  },

  async revoke(id: number) {
    const result = await SessionRepository.update(id, { isRevoked: true })

    if (!result)
      throw new NotFoundException('Session')
  },
}
