import type { Session } from '@api/sessions'
import type { AuthUser } from './auth.schema'
import { InvalidCredentialsException, UnauthenticatedException } from '@api/lib/errors'
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

  checkSessionValidity(session: Session) {
    if (session.isRevoked) {
      throw new UnauthenticatedException('Session is revoked')
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthenticatedException('Session is expired')
    }
  },
}
