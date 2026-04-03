import type { DbClient, DbContext } from '@api/database'
import type { User, UserInsertPayload, UserUpdatePayload } from './user.schema'
import { eq } from 'drizzle-orm'
import { publicColumns, usersTable } from './user.schema'

export interface IUserRepository {
  getAll: (dbContext?: DbContext) => Promise<User[]>
  getById: (id: number, dbContext?: DbContext) => Promise<User | undefined>
  create: (data: UserInsertPayload, dbContext?: DbContext) => Promise<User | undefined>
  update: (id: number, data: UserUpdatePayload, dbContext?: DbContext) => Promise<User | undefined>
  delete: (id: number, dbContext?: DbContext) => Promise<User | undefined>
}

/** Repository for user CRUD operations. */
export function createUserRepository(dbClient: DbClient): IUserRepository {
  return {
    /** Returns all public user records. */
    async getAll(dbContext: DbContext = dbClient): Promise<User[]> {
      const result = await dbContext
        .select(publicColumns)
        .from(usersTable)

      return result
    },

    /** Finds a user by id. */
    async getById(id: number, dbContext: DbContext = dbClient): Promise<User | undefined> {
      const [result] = await dbContext
        .select(publicColumns)
        .from(usersTable)
        .where(eq(usersTable.id, id))

      return result
    },

    /** Creates a user record. */
    async create(data: UserInsertPayload, dbContext: DbContext = dbClient): Promise<User | undefined> {
      const [result] = await dbContext
        .insert(usersTable)
        .values(data)
        .returning(publicColumns)

      return result
    },

    /** Updates a user record. */
    async update(id: number, data: UserUpdatePayload, dbContext: DbContext = dbClient): Promise<User | undefined> {
      const [result] = await dbContext
        .update(usersTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(usersTable.id, id))
        .returning(publicColumns)

      return result
    },

    /** Deletes a user record. */
    async delete(id: number, dbContext: DbContext = dbClient): Promise<User | undefined> {
      const [result] = await dbContext
        .delete(usersTable)
        .where(eq(usersTable.id, id))
        .returning(publicColumns)

      return result
    },
  }
}
