import type { UserInsertPayload, UserUpdatePayload } from './user.schema'
import { NotFoundError } from '@api/lib/errors'
import { UserRepository } from './user.repository'

export const UserService = {
  async getAll() {
    const result = await UserRepository.getAll()

    return result
  },

  async getById(id: number) {
    const result = await UserRepository.getById(id)

    if (!result)
      throw new NotFoundError('User')

    return result
  },

  async create(data: UserInsertPayload) {
    const result = await UserRepository.create(data)

    return result
  },

  async update(id: number, data: UserUpdatePayload) {
    const result = await UserRepository.update(id, data)

    if (!result)
      throw new NotFoundError('User')

    return result
  },

  async delete(id: number) {
    const result = await UserRepository.delete(id)

    if (!result)
      throw new NotFoundError('User')
  },
}
