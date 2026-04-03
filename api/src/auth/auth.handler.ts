import type { createAuthService } from '@api/auth/auth.service'
import type { CookieUtil } from '@api/utils/cookie.util'
import { UserSelectSchema } from '@api/users/user.schema'
import { OpenAPIHono } from '@hono/zod-openapi'
import { AuthRoutes } from './auth.routes'

export interface AuthHandlerDeps {
  authService: ReturnType<typeof createAuthService>
  cookieUtil: typeof CookieUtil
}

/** Sets auth cookies for the client. */
function createCookies(c: any, cookieUtil: typeof CookieUtil, accessToken: string, refreshToken: string) {
  cookieUtil.create(c, 'refresh', refreshToken, 'refresh')
  cookieUtil.create(c, 'access', accessToken, 'access')
}

/** Handler for auth routes. */
export function createAuthHandler({ authService, cookieUtil }: AuthHandlerDeps) {
  return new OpenAPIHono()

    /** Handles user login. */
    .openapi(AuthRoutes.login, async (c) => {
      const { username, password } = c.req.valid('json')

      const authUser = await authService.authenticateUser(username, password)

      const { accessToken, refreshToken } = await authService.performLogin(
        authUser,
        c.req.header('User-Agent'),
        c.req.header('x-forwarded-for')?.split(',')[0],
      )

      createCookies(c, cookieUtil, accessToken, refreshToken)

      return c.json({ message: 'Login successful' }, 200)
    })

    /** Handles token refresh. */
    .openapi(AuthRoutes.refresh, async (c) => {
      const refreshToken = cookieUtil.getRefreshToken(c)
      const { accessToken, refreshToken: newRefreshToken } = await authService.performRefresh(refreshToken)

      createCookies(c, cookieUtil, accessToken, newRefreshToken)

      return c.json({ message: 'Tokens successfully refreshed' }, 200)
    })

    /** Handles user signup. */
    .openapi(AuthRoutes.signup, async (c) => {
      const payload = c.req.valid('json')
      const userAgent = c.req.header('User-Agent')
      const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]

      const { user, accessToken, refreshToken } = await authService.performSignup(payload, userAgent, ipAddress)

      createCookies(c, cookieUtil, accessToken, refreshToken)

      return c.json(UserSelectSchema.parse(user), 201)
    })
}

export type AuthHandler = ReturnType<typeof createAuthHandler>
