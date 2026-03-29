import type { AuthUser } from './auth.schema'
import { InvalidCredentialsException } from '@api/lib/errors'
import { AuthRepository } from './auth.repository'
import { CryptoService } from './crypto.service'

export const AuthService = {
  async getAuthUser(username: string, password: string): Promise<AuthUser> {
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

  async refresh() {},
  async signup() {},
  async logout() {},
}
