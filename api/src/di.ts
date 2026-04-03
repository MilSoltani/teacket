import { AuthService, createAuthRepository } from '@api/auth'
import { db } from '@api/database'
import { createSessionRepository, SessionService } from '@api/sessions'
import { createUserRepository, UserService } from '@api/users'
import { CookieUtil } from '@api/utils/cookie.util'
import { CryptoUtil } from '@api/utils/crypto.util'
import { JwtUtil } from '@api/utils/jwt.util'

export function createRepositories() {
  return {
    authRepository: createAuthRepository(db),
    userRepository: createUserRepository(db),
    sessionRepository: createSessionRepository(db),
  }
}

export function createUtilities() {
  return {
    cryptoUtil: CryptoUtil,
    jwtUtil: JwtUtil,
    cookieUtil: CookieUtil,
  }
}

export function createServices(repositories: ReturnType<typeof createRepositories>, utilities: ReturnType<typeof createUtilities>) {
  const sessionService = SessionService(repositories.sessionRepository)

  return {
    userService: UserService(repositories.userRepository),
    sessionService,
    authService: AuthService(
      repositories.authRepository,
      sessionService,
      utilities.cryptoUtil,
      utilities.jwtUtil,
    ),
  }
}

export function createContainer() {
  const repositories = createRepositories()
  const utilities = createUtilities()

  const services = createServices(repositories, utilities)

  return { repositories, services, utilities }
}

export function containerMiddleware(container: ReturnType<typeof createContainer>) {
  return async (c: any, next: any) => {
    c.set('container', container)
    await next()
  }
}
