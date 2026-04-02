import type { Session } from './session.schema'
import { ForbiddenException, NotFoundException, UnauthenticatedException } from '@api/lib'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

vi.mock('./session.repository', () => ({
  SessionRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getSessionByHash: vi.fn(),
    rotateSession: vi.fn(),
    revokeEntireFamily: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@api/env', () => ({
  env: {},
}))

describe('sessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const SESSION_1 = {
    id: 1,
    userId: 1,
    ipAddress: '192.168.0.1',
    userAgent: 'bruno-runtime/3.1.4',
    refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
    familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
    isUsed: false,
    isRevoked: false,
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('getById', () => {
    it('returns session wehen found', async () => {
      vi.mocked(SessionRepository.getSessionByHash).mockResolvedValue(SESSION_1)

      const result = await SessionService.getSessionByHash('a-dummy-hash')

      expect(result).toEqual(SESSION_1)
    })

    it('throws exception when hash not found', async () => {
      vi.mocked(SessionRepository.getSessionByHash).mockResolvedValue(undefined)

      await expect(SessionService.getSessionByHash('a-dummy-hash')).rejects.toThrow(new NotFoundException('Session'))
    })
  })

  describe('checkSessionValidity', () => {
    it('throws if session is revoked', async () => {
      const session: Session = { ...SESSION_1, isRevoked: true }

      expect(SessionService.checkSessionValidity(session))
        .rejects
        .toThrow(new UnauthenticatedException('Session revoked'))
    })

    it('throws if session is expired', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDay() - 1)

      const session: Session = {
        ...SESSION_1,
        expiresAt: yesterday,
      }

      expect(SessionService.checkSessionValidity(session))
        .rejects
        .toThrow(new UnauthenticatedException('Session expired'))
    })

    it('throws if session is reused', async () => {
      const session: Session = {
        ...SESSION_1,
        isUsed: true,
      }

      expect(SessionService.checkSessionValidity(session))
        .rejects
        .toThrow(new ForbiddenException('Security breach detected. All sessions revoked.'))
    })

    it('revokes all family sessions if session is reused', async () => {
      const session: Session = {
        ...SESSION_1,
        isUsed: true,
      }

      vi.mocked(SessionRepository.revokeEntireFamily)

      await expect(SessionService.checkSessionValidity(session)).rejects.toThrow()
      expect(SessionRepository.revokeEntireFamily).toHaveBeenCalledOnce()
      expect(SessionRepository.revokeEntireFamily).toHaveBeenCalledWith(session.familyId)
    })
  })

  describe('create', async () => {
    it('creates session with given payload', async () => {
      const { id, createdAt, updatedAt, ...sessionPayload } = SESSION_1

      vi.mocked(SessionRepository.create).mockResolvedValue(SESSION_1)

      const result = await SessionService.create(sessionPayload)

      expect(SessionRepository.create).toHaveBeenCalledOnce()
      expect(SessionRepository.create).toHaveBeenCalledWith(sessionPayload)
      expect(result).toEqual(SESSION_1)
    })
  })

  describe('setRevoked', async () => {
    it('sets session revoked=true when found', async () => {
      vi.mocked(SessionRepository.update).mockResolvedValue(SESSION_1)

      await SessionService.setRevoked(1)

      expect(SessionRepository.update).toHaveBeenCalledOnce()
      expect(SessionRepository.update).toHaveBeenCalledWith(1, { isRevoked: true })
    })

    it('throws exception when hash not found', async () => {
      vi.mocked(SessionRepository.update).mockResolvedValue(undefined)

      await expect(SessionService.setRevoked(1)).rejects.toThrow(new NotFoundException('Session'))
    })
  })

  describe('setSessionIsUsed', async () => {
    it('sets session isUsed=true when found', async () => {
      vi.mocked(SessionRepository.update).mockResolvedValue(SESSION_1)

      await SessionService.setSessionIsUsed(1)

      expect(SessionRepository.update).toHaveBeenCalledOnce()
      expect(SessionRepository.update).toHaveBeenCalledWith(1, { isUsed: true })
    })

    it('throws exception when hash not found', async () => {
      vi.mocked(SessionRepository.update).mockResolvedValue(undefined)

      await expect(SessionService.setSessionIsUsed(1)).rejects.toThrow(new NotFoundException('Session'))
    })
  })
})
