import type { Session } from '@api/sessions/session.schema'
import { ForbiddenException, UnauthenticatedException } from '@api/lib/errors'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthService } from './auth.service'

vi.mock('@api/env', () => ({
  env: {
    REFRESH_TOKEN_EXPIRY: 60 * 60 * 24 * 7,
  },
}))

const sessionService = {
  create: vi.fn(),
  getAll: vi.fn(),
  getById: vi.fn(),
  getSessionByHash: vi.fn(),
  rotateSession: vi.fn(),
  revokeEntireFamily: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const authRepository = {
  getAll: vi.fn(),
  getById: vi.fn(),
  getUserForAuth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

const cryptoUtil = {
  compare: vi.fn(),
  hash: vi.fn(),
  sha256: vi.fn(),
  genUuid: vi.fn(),
}

const jwtUtil = {
  generate: vi.fn(),
  verify: vi.fn(),
}

const AuthService = createAuthService(authRepository as any, sessionService as any, cryptoUtil as any, jwtUtil as any)

describe('authService', () => {
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
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('checkSessionValidity', () => {
    it('throws if session is revoked', async () => {
      const session: Session = { ...SESSION_1, isRevoked: true }

      await expect(AuthService.checkSessionValidity(session))
        .rejects
        .toThrow(new UnauthenticatedException('Session revoked'))
    })

    it('throws if session is expired', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const session: Session = {
        ...SESSION_1,
        expiresAt: yesterday,
      }

      await expect(AuthService.checkSessionValidity(session))
        .rejects
        .toThrow(new UnauthenticatedException('Session expired'))
    })

    it('throws if session is reused', async () => {
      const session: Session = {
        ...SESSION_1,
        isUsed: true,
        expiresAt: new Date(Date.now() + 60_000),
      }

      await expect(AuthService.checkSessionValidity(session))
        .rejects
        .toThrow(new ForbiddenException('Security breach detected. All sessions revoked.'))
    })

    it('revokes all family sessions if session is reused', async () => {
      const session: Session = {
        ...SESSION_1,
        isUsed: true,
        expiresAt: new Date(Date.now() + 60_000),
      }

      await expect(AuthService.checkSessionValidity(session)).rejects.toThrow()
      expect(sessionService.revokeEntireFamily).toHaveBeenCalledOnce()
      expect(sessionService.revokeEntireFamily).toHaveBeenCalledWith(session.familyId)
    })
  })
})
