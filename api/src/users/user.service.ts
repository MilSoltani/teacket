import type { UserInsertPayload, UserUpdatePayload } from '@api/users/user.schema'
import type { IUserRepository } from './user.repository'
import { NotFoundException } from '@api/lib/errors'

export function UserService(userRepository: IUserRepository) {
  return {
    async getAll() {
      const result = await userRepository.getAll()

      return result
    },

    async getById(id: number) {
      const result = await userRepository.getById(id)

      if (!result)
        throw new NotFoundException('User')

      return result
    },

    async create(data: UserInsertPayload) {
      const result = await userRepository.create(data)

      return result
    },

    async update(id: number, data: UserUpdatePayload) {
      const result = await userRepository.update(id, data)

      if (!result)
        throw new NotFoundException('User')

      return result
    },

    async delete(id: number) {
      const result = await userRepository.delete(id)

      if (!result)
        throw new NotFoundException('User')

      return result
    },
  }
}
