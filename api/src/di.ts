import { createAuthRepository, createAuthService } from '@api/auth'
import { db } from '@api/database'
import { createSessionRepository, SessionService as createSessionService } from '@api/sessions'
import { createUserRepository, UserService as createUserService } from '@api/users'
import { CookieUtil } from '@api/utils/cookie.util'
import { CryptoUtil } from '@api/utils/crypto.util'
import { JwtUtil } from '@api/utils/jwt.util'

type Repositories = ReturnType<typeof createRepositories>
type Utilities = ReturnType<typeof createUtilities>

interface Services {
  userService: ReturnType<typeof createUserService>
  sessionService: ReturnType<typeof createSessionService>
  authService: ReturnType<typeof createAuthService>
}

interface Container {
  repositories: Repositories
  utilities: Utilities
  services: Services
}

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

export function createServices({ repositories, utilities }: { repositories: Repositories, utilities: Utilities }): Services {
  const sessionService = createSessionService(repositories.sessionRepository)

  return {
    userService: createUserService(repositories.userRepository),
    sessionService,
    authService: createAuthService(
      repositories.authRepository,
      sessionService,
      utilities.cryptoUtil,
      utilities.jwtUtil,
    ),
  }
}

export function createContainer(): Container {
  const repositories = createRepositories()
  const utilities = createUtilities()

  const services = createServices({ repositories, utilities })

  return { repositories, services, utilities }
}
