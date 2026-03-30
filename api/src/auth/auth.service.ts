import type { AuthUser } from './auth.schema'
import { CryptoService } from '@api/lib/auth'
import { InvalidCredentialsException } from '@api/lib/errors'
import { AuthRepository } from './auth.repository'

export const AuthService = {
  async authenticateUser(username: string, password: string): Promise<AuthUser> {
    const user = await AuthRepository.getUserForAuth(username)

    if (!user?.password) {
      throw new InvalidCredentialsException()
    }

    const isValid = await CryptoService.compare(password, user.password)

    if (!isValid) {
      throw new InvalidCredentialsException()
    }

    return user
  },
}
