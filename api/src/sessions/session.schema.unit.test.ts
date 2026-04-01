import { describe, expect, it } from 'vitest'
import { SessionInsertSchema, SessionUpdateSchema } from './session.schema'

describe('sessionSchema', () => {
  describe('insert validation', () => {
    it('accepts valid payload', () => {
      const payload = {
        userId: 1,
        ipAddress: '192.168.0.1',
        userAgent: 'bruno-runtime/3.1.4',
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
        isUsed: false,
        isRevoked: false,
        expiresAt: new Date(),
      }

      const result = SessionInsertSchema.safeParse(payload)

      expect(result.success).toBe(true)
    })

    describe('ipAddress boundaries', () => {
      const tests = [
        { ipAddress: 'a'.repeat(50), valid: true, desc: 'exactly 255 chars' },
        { ipAddress: 'a'.repeat(51), valid: false, desc: 'longer than 255 chars' },
      ]

      tests.forEach(({ ipAddress, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} ipAddress ${desc}`, () => {
          const payload = {
            ipAddress,
            userId: 1,
            userAgent: 'bruno-runtime/3.1.4',
            refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
            familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
            isUsed: false,
            isRevoked: false,
            expiresAt: new Date(),
          }
          const result = SessionInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    describe('userAgent boundaries', () => {
      const tests = [
        { userAgent: 'a'.repeat(255), valid: true, desc: 'exactly 255 chars' },
        { userAgent: 'a'.repeat(256), valid: false, desc: 'longer than 255 chars' },
      ]

      tests.forEach(({ userAgent, valid, desc }) => {
        it(`${valid ? 'accepts' : 'rejects'} userAgent ${desc}`, () => {
          const payload = {
            userAgent,
            userId: 1,
            ipAddress: '192.168.0.1',
            refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
            familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
            isUsed: false,
            isRevoked: false,
            expiresAt: new Date(),
          }
          const result = SessionInsertSchema.safeParse(payload)
          expect(result.success).toBe(valid)
        })
      })
    })

    it('rejects createdAt in insert', () => {
      const payload = {
        userId: 1,
        ipAddress: '192.168.0.1',
        userAgent: 'bruno-runtime/3.1.4',
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
        isUsed: false,
        isRevoked: false,
        expiresAt: new Date(),
        createdAt: new Date(),
      }

      const result = SessionInsertSchema.safeParse(payload)

      expect(result.success).toBe(false)
    })

    it('rejects updatedAt in insert', () => {
      const payload = {
        userId: 1,
        ipAddress: '192.168.0.1',
        userAgent: 'bruno-runtime/3.1.4',
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
        isUsed: false,
        isRevoked: false,
        expiresAt: new Date(),
        updatedAt: new Date(),
      }

      const result = SessionInsertSchema.safeParse(payload)

      expect(result.success).toBe(false)
    })

    it('rejects missing required fields', () => {
      const result = SessionInsertSchema.safeParse({})

      expect(result.success).toBe(false)
    })

    it('rejects unknown fields', () => {
      const payload = {
        userId: 1,
        ipAddress: '192.168.0.1',
        userAgent: 'bruno-runtime/3.1.4',
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
        isUsed: false,
        isRevoked: false,
        unknown: 'abc',
      }

      const result = SessionInsertSchema.safeParse(payload)

      expect(result.success).toBe(false)
    })

    it('rejects invalid UUID for familyId', () => {
      const payload = {
        userId: 1,
        ipAddress: '192.168.0.1',
        userAgent: 'bruno-runtime/3.1.4',
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: 'not-a-uuid',
        isUsed: false,
        isRevoked: false,
        expiresAt: new Date().toISOString(),
      }
      const result = SessionInsertSchema.safeParse(payload)

      expect(result.success).toBe(false)
    })

    it('allows explicit null for optional fields', () => {
      const payload = {
        userId: 1,
        refreshTokenHash: 'fc0c3db007a53770cdc765b5027fc8372c5f3cc9a2a609bbd5f8656d684fff1a',
        familyId: '6fca1ce2-2c5e-4bb3-8a23-77674733bb1c',
        isUsed: false,
        isRevoked: false,
        expiresAt: new Date(),
        ipAddress: null,
        userAgent: null,
      }
      const result = SessionInsertSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })
  })

  describe('update validation', () => {
    it('allows partial updates', () => {
      const payload = {
        refreshTokenHash: 'xyz',
      }

      const result = SessionUpdateSchema.safeParse(payload)

      expect(result.success).toBe(true)
    })
  })
})
