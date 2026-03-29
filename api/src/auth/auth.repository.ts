import type { AuthUser } from './auth.schema'
import { db } from '@api/database'
import { usersTable } from '@api/users'
import { eq } from 'drizzle-orm'

export const AuthRepository = {
  async getUserForAuth(username: string): Promise<AuthUser | undefined> {
    const result = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        password: usersTable.password,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username))

    return result[0]
  },
}
