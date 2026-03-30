import type { User } from './user.schema'
import { NotFoundException } from '@api/lib/errors'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

vi.mock('./user.repository', () => ({
  UserRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('userService', () => {
  const NON_EXISTENT_USER_ID = 999

  const USER_1: User = {
    id: 1,
    firstName: 'brian',
    lastName: 'adams',
    username: 'badams',
    email: 'badams@mail.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const USER_2: User = {
    id: 2,
    firstName: 'john',
    lastName: 'smith',
    username: 'jsmith',
    email: 'jsmith@mail.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getAll', () => {
    it('returns all users', async () => {
      vi.mocked(UserRepository.getAll).mockResolvedValue([USER_1, USER_2])

      const result = await UserService.getAll()

      expect(UserRepository.getAll).toHaveBeenCalledOnce()
      expect(result).toEqual([USER_1, USER_2])
    })
  })

  describe('getById', () => {
    it('returns user when found', async () => {
      vi.mocked(UserRepository.getById).mockResolvedValue(USER_1)

      const result = await UserService.getById(1)

      expect(UserRepository.getById).toHaveBeenCalledOnce()
      expect(result).toEqual(USER_1)
    })

    it('throws NotFoundException when user not found', async () => {
      vi.mocked(UserRepository.getById).mockResolvedValue(undefined)

      await expect(UserService.getById(NON_EXISTENT_USER_ID))
        .rejects
        .toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('creates user with given payload', async () => {
      const { id, createdAt, updatedAt, ...user } = USER_1

      vi.mocked(UserRepository.create).mockResolvedValue(USER_1)

      const result = await UserService.create(user)

      expect(UserRepository.create).toHaveBeenCalledOnce()
      expect(UserRepository.create).toHaveBeenCalledWith(user)
      expect(result).toEqual(USER_1)
    })
  })

  describe('update', () => {
    it('updates user when found', async () => {
      const email = 'test@test.com'

      vi.mocked(UserRepository.update).mockResolvedValue(USER_1)

      const result = await UserService.update(1, { email })

      expect(UserRepository.update).toHaveBeenCalledWith(1, { email })
      expect(result).toEqual(USER_1)
    })

    it('throws when user does not exist', async () => {
      vi.mocked(UserRepository.update).mockResolvedValue(undefined)

      const email = 'mail@test.test'

      await expect(UserService.update(NON_EXISTENT_USER_ID, { email }))
        .rejects
        .toThrow(NotFoundException)
    })
  })

  describe('delete', () => {
    it('deletes user when found', async () => {
      vi.mocked(UserRepository.delete).mockResolvedValue(USER_1)

      const result = await UserService.delete(1)

      expect(UserRepository.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual(USER_1)
    })

    it('throws NotFoundException when user not found', async () => {
      vi.mocked(UserRepository.delete).mockResolvedValue(undefined)

      await expect(UserService.delete(NON_EXISTENT_USER_ID))
        .rejects
        .toThrow(NotFoundException)
    })
  })
})
