import type { UserInsertPayload, UserUpdatePayload } from '@api/users/user.schema'
import type { IUserRepository } from './user.repository'
import { NotFoundException } from '@api/lib/errors'

/** Service for user management. */
export function createUserService(userRepository: IUserRepository) {
  return {
    /** Returns all users. */
    async getAll() {
      const result = await userRepository.getAll()

      return result
    },

    /** Finds a user by id. */
    async getById(id: number) {
      const result = await userRepository.getById(id)

      if (!result)
        throw new NotFoundException('User')

      return result
    },

    /** Creates a user. */
    async create(data: UserInsertPayload) {
      const result = await userRepository.create(data)

      return result
    },

    /** Updates a user. */
    async update(id: number, data: UserUpdatePayload) {
      const result = await userRepository.update(id, data)

      if (!result)
        throw new NotFoundException('User')

      return result
    },

    /** Deletes a user. */
    async delete(id: number) {
      const result = await userRepository.delete(id)

      if (!result)
        throw new NotFoundException('User')

      return result
    },
  }
}
