import type { Session, SessionRepository, SessionService } from '@api/sessions'
import type { User } from '@api/users'
import type { CookieUtil } from '@api/utils/cookie.util'
import type { CryptoUtil } from '@api/utils/crypto.util'
import type { JwtUtil } from '@api/utils/jwt.util'

import type { AuthRepository } from './auth.repository'
import type { AuthUser, SignupPayload } from './auth.schema'
import { env } from '@api/env'
import { ForbiddenException, InvalidCredentialsException, UnauthenticatedException } from '@api/lib/errors'

export function AuthService(
  authRepository: typeof AuthRepository,
  sessionRepository: typeof SessionRepository,
  cryptoUtil: typeof CryptoUtil,
  jwtUtil: typeof JwtUtil,
  cookieUtil: typeof CookieUtil,
  sessionService: ReturnType<typeof SessionService>,
) {
  return {
    async authenticateUser(username: string, password: string): Promise<AuthUser> {
      const user = await authRepository.getUserForAuth(username)

      if (!user?.password) {
        throw new InvalidCredentialsException()
      }

      const isValid = await cryptoUtil.compare(password, user.password)

      if (!isValid) {
        throw new InvalidCredentialsException()
      }

      return user
    },

    async performLogin(authUser: AuthUser, userAgent?: string, ipAddress?: string) {
      const accessToken = await jwtUtil.generate(authUser.id, 'access')
      const refreshToken = await jwtUtil.generate(authUser.id, 'refresh')

      const refreshTokenHash = cryptoUtil.sha256(refreshToken)
      const familyId = cryptoUtil.genUuid()
      const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY * 1000)

      await sessionRepository.create({
        userId: authUser.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        familyId,
        expiresAt,
      })

      return { accessToken, refreshToken }
    },

    async checkSessionValidity(session: Session) {
      if (session.isRevoked) {
        throw new UnauthenticatedException('Session revoked')
      }

      if (new Date() <= session.expiresAt) {
        throw new UnauthenticatedException('Session expired')
      }

      if (session.isUsed) {
        await sessionRepository.revokeEntireFamily(session.familyId)
        throw new ForbiddenException('Security breach detected. All sessions revoked.')
      }
    },

    async performRefresh(refreshToken: string) {
      const hashedToken = cryptoUtil.sha256(refreshToken)
      const session = await sessionService.getSessionByHash(hashedToken)

      await this.checkSessionValidity(session)

      const payload = await jwtUtil.verify(refreshToken, 'refresh')
      const userId = payload.sub as number

      const newAccessToken = await jwtUtil.generate(userId, 'access')
      const newRefreshToken = await jwtUtil.generate(userId, 'refresh')
      const newHashedToken = cryptoUtil.sha256(newRefreshToken)

      await sessionService.rotateSession(session, newHashedToken)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    },

    async performSignup(payload: SignupPayload, userAgent?: string, ipAddress?: string): Promise<{ user: User, accessToken: string, refreshToken: string }> {
      const hashedPassword = await cryptoUtil.hash(payload.password)

      const user = await authRepository.create({
        ...payload,
        password: hashedPassword,
      })

      const accessToken = await jwtUtil.generate(user.id, 'access')
      const refreshToken = await jwtUtil.generate(user.id, 'refresh')

      const refreshTokenHash = cryptoUtil.sha256(refreshToken)
      const familyId = cryptoUtil.genUuid()
      const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY * 1000)

      await sessionService.create({
        userId: user.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        familyId,
        expiresAt,
      })

      return { user, accessToken, refreshToken }
    },

  }
}
