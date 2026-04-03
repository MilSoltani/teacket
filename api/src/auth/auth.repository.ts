import type { DbClient, DbContext } from '@api/database'
import type { User } from '@api/users'
import type { AuthUser, SignupPayload } from './auth.schema'
import { publicColumns, usersTable } from '@api/users'
import { eq } from 'drizzle-orm'

export interface IAuthRepository {
  getUserForAuth: (username: string, dbContext?: DbContext) => Promise<AuthUser | undefined>
  create: (data: SignupPayload, dbContext?: DbContext) => Promise<User>
}

/** Repository for auth-specific user lookup and creation. */
export function createAuthRepository(dbClient: DbClient): IAuthRepository {
  return {

    /** Finds a user record for authentication. */
    async getUserForAuth(username: string, dbContext: DbContext = dbClient): Promise<AuthUser | undefined> {
      const result = await dbContext
        .select({
          id: usersTable.id,
          username: usersTable.username,
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.username, username))

      return result[0] as AuthUser
    },

    /** Creates a new user for signup. */
    async create(data: SignupPayload, dbContext: DbContext = dbClient): Promise<User> {
      const [result] = await dbContext
        .insert(usersTable)
        .values(data)
        .returning(publicColumns)

      return result
    },
  }
}
