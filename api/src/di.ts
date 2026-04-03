import { AuthRepository, AuthService } from '@api/auth'
import { SessionRepository, SessionService } from '@api/sessions'
import { UserRepository, UserService } from '@api/users'
import { CookieUtil } from '@api/utils/cookie.util'
import { CryptoUtil } from '@api/utils/crypto.util'
import { JwtUtil } from '@api/utils/jwt.util'

export function createRepositories() {
  return {
    auth: AuthRepository,
    user: UserRepository,
    session: SessionRepository,
  }
}

export function createUtilities() {
  return {
    crypto: CryptoUtil,
    jwt: JwtUtil,
    cookie: CookieUtil,
  }
}

export function createServices(repositories: ReturnType<typeof createRepositories>, utilities: ReturnType<typeof createUtilities>) {
  const session = SessionService(repositories.session)

  return {
    user: UserService(repositories.user),
    session,
    auth: AuthService(
      repositories.auth,
      repositories.session,
      utilities.crypto,
      utilities.jwt,
      utilities.cookie,
      session,
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
