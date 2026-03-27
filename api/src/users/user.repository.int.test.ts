import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRepository } from './user.repository'

describe('usersRepository', () => {
  const NON_EXISTENT_USER_ID = 999

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return empty array if no user exist', async () => {
      const result = await UserRepository.getAll()

      expect(result.length).toBe(0)
    })
  })

  describe('getById', () => {
    it('should return undefined if user does not exist', async () => {
      const result = await UserRepository.getById(NON_EXISTENT_USER_ID)

      expect(result).toBeUndefined()
    })
  })

  describe.todo('create', () => {})

  describe.todo('update', () => {})

  describe.todo('delete', () => {})
})
