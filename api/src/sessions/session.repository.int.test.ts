import type { UserInsertPayload } from '@api/users'
import type { SessionInsertPayload } from './session.schema'
import { UserRepository } from '@api/users'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionRepository } from './session.repository'

describe('sessionsRepository', () => {
  const NON_EXISTENT_SESSION_ID = 999

  const USER_1: UserInsertPayload = {
    username: 'badams',
    email: 'badams@mail.com',
  }

  let session_1: SessionInsertPayload
  let session_2: SessionInsertPayload

  beforeEach(async () => {
    const createdUser = await UserRepository.create(USER_1)
    const userId = createdUser!.id

    session_1 = {
      userId,
      refreshTokenHash: 'XYZSECRETSVERYIMPORTANT1',
      expiresAt: new Date(),
    }

    session_2 = {
      userId,
      refreshTokenHash: 'XYZSECRETSVERYIMPORTANT2',
      expiresAt: new Date(),
    }
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('returns empty array when no session exist', async () => {
      const result = await SessionRepository.getAll()

      expect(result.length).toBe(0)
    })

    it('returns all inserted sessions', async () => {
      const s1 = await SessionRepository.create(session_1)
      const s2 = await SessionRepository.create(session_2)

      const result = await SessionRepository.getAll()

      expect(result.length).toBe(2)
      expect(result.some(u => u.userId === s1!.userId)).toBe(true)
      expect(result.some(u => u.refreshTokenHash === s2!.refreshTokenHash)).toBe(true)
    })
  })

  describe('getById', () => {
    it('returns undefined if session does not exist', async () => {
      const result = await SessionRepository.getById(NON_EXISTENT_SESSION_ID)

      expect(result).toBeUndefined()
    })

    it('returns correct session for valid ID', async () => {
      const s1 = await SessionRepository.create(session_1)

      const result = await SessionRepository.getById(s1!.id)

      expect(result).toBeDefined()
      expect(result!.id).toBe(s1!.id)
    })
  })

  describe('create', () => {
    it('inserts valid session and returns it', async () => {
      const s1 = await SessionRepository.create(session_1)

      const result = await SessionRepository.getById(s1!.id)

      expect(result).toBeDefined()
      expect(result!.userId).toBe(s1!.userId)
      expect(result!.refreshTokenHash).toBe(s1!.refreshTokenHash)
      expect(result!.expiresAt).toEqual(s1!.expiresAt)
    })

    it('autogenerates fields', async () => {
      const s1 = await SessionRepository.create(session_1)

      const result = await SessionRepository.getById(s1!.id)

      expect(result).toBeDefined()
      expect(result!.id).toBe(s1!.id)
      expect(result!.createdAt).toBeInstanceOf(Date)
      expect(result!.updatedAt).toBeInstanceOf(Date)
    })

    it('fails on invalid input', async () => {
      const SESSION = {
        userIdx: 1,
        refreshTokenHash: 'XYZSECRETSVERYIMPORTANT1',
        expiresAt: new Date(),
      }

      await expect(SessionRepository.create(SESSION as any)).rejects.toThrow()
    })

    it('failes on unique constraint violation of refreshTokenHash', async () => {
      await SessionRepository.create(session_1)

      const SESSION_3 = { ...session_2, refreshTokenHash: session_1.refreshTokenHash }
      await expect(SessionRepository.create(SESSION_3)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates fields correctly', async () => {
      const s1 = await SessionRepository.create(session_1)

      const refreshTokenHash = 'NEWSECRET!'
      const isRevoked = true

      const updatedSession = await SessionRepository.update(s1!.id, {
        refreshTokenHash,
        isRevoked,
      })

      expect(updatedSession!.refreshTokenHash).toEqual(refreshTokenHash)
      expect(updatedSession!.isRevoked).toEqual(isRevoked)
    })

    it('does not overwrite unspecified fields', async () => {
      const s1 = await SessionRepository.create(session_1)

      const refreshTokenHash = 'NEWSECRET!'

      const updatedSession = await SessionRepository.update(s1!.id, {
        refreshTokenHash,
      })

      expect(updatedSession!.isRevoked).toEqual(s1!.isRevoked)
      expect(updatedSession!.createdAt).toEqual(s1!.createdAt)
    })

    it('updates updatedAt', async () => {
      const s1 = await SessionRepository.create(session_1)

      const refreshTokenHash = 'NEWSECRET!'

      const updatedSession = await SessionRepository.update(s1!.id, {
        refreshTokenHash,
      })

      expect(updatedSession!.updatedAt).not.toEqual(s1!.updatedAt)
    })

    it('returns empty array when no session exist', async () => {
      const updatedSession = await SessionRepository.update(
        NON_EXISTENT_SESSION_ID,
        { refreshTokenHash: 'NEWSECRET!' },
      )

      expect(updatedSession).toBeUndefined()
    })

    it('failes on unique constraint violation of refreshTokenHash', async () => {
      const s1 = await SessionRepository.create(session_1)
      await SessionRepository.create(session_2)

      const refreshTokenHash = session_2.refreshTokenHash

      await expect(SessionRepository.update(
        s1!.id,
        { refreshTokenHash },
      )).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('deletes existing session and returns it', async () => {
      const s1 = await SessionRepository.create(session_1)

      const deletedSession = await SessionRepository.delete(s1!.id)

      expect(deletedSession).toBeDefined()
      expect(deletedSession?.refreshTokenHash).toEqual(s1?.refreshTokenHash)
    })

    it('deletes existing session and session no longer exist', async () => {
      const s1 = await SessionRepository.create(session_1)

      await SessionRepository.delete(s1!.id)
      const result = await SessionRepository.getById(s1!.id)

      expect(result).toBeUndefined()
    })

    it('returns undefined if ID does not exist', async () => {
      const result = await SessionRepository.delete(NON_EXISTENT_SESSION_ID)

      expect(result).toBeUndefined()
    })
  })
})
