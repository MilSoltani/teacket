import type { UserInsertPayload } from './user.schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRepository } from './user.repository'

describe('usersRepository', () => {
  const NON_EXISTENT_USER_ID = 999

  const USER_1: UserInsertPayload = {
    username: 'badams',
    firstName: 'brian',
    lastName: 'adams',
    email: 'badams@mail.com',
  }

  const USER_2: UserInsertPayload = {
    username: 'jsmith',
    firstName: 'john',
    lastName: 'smith',
    email: 'jsmith@mail.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('returns empty array when no user exist', async () => {
      const result = await UserRepository.getAll()

      expect(result.length).toBe(0)
    })

    it('returns all inserted users', async () => {
      const u1 = await UserRepository.create(USER_1)
      const u2 = await UserRepository.create(USER_2)

      const result = await UserRepository.getAll()

      expect(result.length).toBe(2)
      expect(result.some(u => u.username === u1!.username)).toBe(true)
      expect(result.some(u => u.username === u2!.username)).toBe(true)
    })

    it('returns only public columns', async () => {
      const u = { ...USER_1, password: '123' }
      await UserRepository.create(u as any)

      const result = await UserRepository.getAll()

      expect(result.length).toEqual(1)
      expect(Object.keys(result[0]).includes('password')).toBe(false)
    })
  })

  describe('getById', () => {
    it('returns undefined if user does not exist', async () => {
      const result = await UserRepository.getById(NON_EXISTENT_USER_ID)

      expect(result).toBeUndefined()
    })

    it('returns correct user for valid ID', async () => {
      const u1 = await UserRepository.create(USER_1)

      const result = await UserRepository.getById(u1!.id)

      expect(result).toBeDefined()
      expect(result!.id).toBe(u1!.id)
    })

    it('returns only public columns', async () => {
      const u = { ...USER_1, password: '123' }
      const createdUser = await UserRepository.create(u as any)

      const result = await UserRepository.getById(createdUser!.id)

      expect(Object.keys(result!).includes('password')).toBe(false)
    })
  })

  describe('create', () => {
    it('inserts valid user and returns it', async () => {
      const u1 = await UserRepository.create(USER_1)

      const result = await UserRepository.getById(u1!.id)

      expect(result).toBeDefined()
      expect(result!.username).toBe(u1!.username)
      expect(result!.firstName).toBe(u1!.firstName)
      expect(result!.lastName).toBe(u1!.lastName)
      expect(result!.email).toBe(u1!.email)
    })

    it('autogenerates fields', async () => {
      const u1 = await UserRepository.create(USER_1)

      const result = await UserRepository.getById(u1!.id)

      expect(result).toBeDefined()
      expect(result!.id).toBe(u1!.id)
      expect(result!.createdAt).toBeInstanceOf(Date)
      expect(result!.updatedAt).toBeInstanceOf(Date)
    })

    it('fails on invalid input', async () => {
      const USER = {
        firstName: 'brian',
        lastName: 'adams',
        email: 'badams@mail.com',
      }

      await expect(UserRepository.create(USER as any)).rejects.toThrow()
    })

    it('failes on unique constraint violation of email', async () => {
      await UserRepository.create(USER_1)

      const USER_3 = { ...USER_2, email: USER_1.email }
      await expect(UserRepository.create(USER_3)).rejects.toThrow()
    })

    it('failes on unique constraint violation of username', async () => {
      await UserRepository.create(USER_1)

      const USER_3 = { ...USER_2, username: USER_1.username }
      await expect(UserRepository.create(USER_3)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates fields correctly', async () => {
      const u1 = await UserRepository.create(USER_1)

      const newFirstName = 'George'
      const newEmail = 'george@mail.com'

      const updatedUser = await UserRepository.update(u1!.id, {
        firstName: newFirstName,
        email: newEmail,
      })

      expect(updatedUser!.firstName).toEqual(newFirstName)
      expect(updatedUser!.email).toEqual(newEmail)
    })

    it('does not overwrite unspecified fields', async () => {
      const u1 = await UserRepository.create(USER_1)

      const newFirstName = 'George'
      const newEmail = 'george@mail.com'

      const updatedUser = await UserRepository.update(u1!.id, {
        firstName: newFirstName,
        email: newEmail,
      })

      expect(updatedUser!.lastName).toEqual(u1!.lastName)
      expect(updatedUser!.createdAt).toEqual(u1!.createdAt)
    })

    it('updates updatedAt', async () => {
      const u1 = await UserRepository.create(USER_1)

      const newFirstName = 'George'

      const updatedUser = await UserRepository.update(u1!.id, {
        firstName: newFirstName,
      })

      expect(updatedUser!.updatedAt).not.toEqual(u1!.updatedAt)
    })

    it('returns empty array when no user exist', async () => {
      const updatedUser = await UserRepository.update(
        NON_EXISTENT_USER_ID,
        { firstName: 'newFirstName' },
      )

      expect(updatedUser).toBeUndefined()
    })

    it('failes on unique constraint violation of email', async () => {
      const u1 = await UserRepository.create(USER_1)
      await UserRepository.create(USER_2)

      await expect(UserRepository.update(
        u1!.id,
        { email: USER_2.email },
      ),
      ).rejects.toThrow()
    })

    it('failes on unique constraint violation of username', async () => {
      const u1 = await UserRepository.create(USER_1)
      await UserRepository.create(USER_2)

      await expect(UserRepository.update(
        u1!.id,
        { username: USER_2.username },
      ),
      ).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('deletes existing user and returns it', async () => {
      const u1 = await UserRepository.create(USER_1)

      const deletedUser = await UserRepository.delete(u1!.id)

      expect(deletedUser).toBeDefined()
      expect(deletedUser?.username).toEqual(u1?.username)
    })

    it('deletes existing user and user no longer exist', async () => {
      const u1 = await UserRepository.create(USER_1)

      await UserRepository.delete(u1!.id)
      const result = await UserRepository.getById(u1!.id)

      expect(result).toBeUndefined()
    })

    it('returns undefined if ID does not exist', async () => {
      const result = await UserRepository.delete(NON_EXISTENT_USER_ID)

      expect(result).toBeUndefined()
    })
  })
})
