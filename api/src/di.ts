import type { DbClient } from '@api/database'
import { createAuthRepository, createAuthService } from '@api/auth'
import { createSessionRepository, createSessionService } from '@api/sessions'
import { createUserRepository, createUserService } from '@api/users'
import { CookieUtil } from '@api/utils/cookie.util'
import { CryptoUtil } from '@api/utils/crypto.util'
import { JwtUtil } from '@api/utils/jwt.util'

type Repositories = ReturnType<typeof createRepositories>
type Utilities = ReturnType<typeof createUtilities>

export function createRepositories(dbClient: DbClient) {
  return {
    authRepository: createAuthRepository(dbClient),
    userRepository: createUserRepository(dbClient),
    sessionRepository: createSessionRepository(dbClient),
  }
}

export function createUtilities() {
  return {
    cryptoUtil: CryptoUtil,
    jwtUtil: JwtUtil,
    cookieUtil: CookieUtil,
  }
}

interface ServiceDeps {
  repositories: Repositories
  utilities: Utilities
}

export function createServices({ repositories, utilities }: ServiceDeps) {
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

export function createContainer(dbClient: DbClient) {
  const repositories = createRepositories(dbClient)
  const utilities = createUtilities()
  const services = createServices({ repositories, utilities })

  return {
    repositories,
    utilities,
    services,
  } as const
}

export type Services = ReturnType<typeof createServices>
export type Container = ReturnType<typeof createContainer>
