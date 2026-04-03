import type { AppEnvironment } from '@api/lib/types'
import { UserSelectSchema } from '@api/users'
import { OpenAPIHono } from '@hono/zod-openapi'
import { AuthRoutes } from './auth.routes'

function createCookies(c: any, accessToken: string, refreshToken: string) {
  const { cookie: cookieUtil } = c.var.container.utilities

  cookieUtil.create(c, 'refresh', refreshToken, 'refresh')
  cookieUtil.create(c, 'access', accessToken, 'access')
}

export const AuthHandler = new OpenAPIHono<AppEnvironment>()
  .openapi(AuthRoutes.login, async (c) => {
    const { auth: authService } = c.var.container.services

    const { username, password } = c.req.valid('json')

    const authUser = await authService.authenticateUser(username, password)

    const { accessToken, refreshToken } = await authService.performLogin(
      authUser,
      c.req.header('User-Agent'),
      c.req.header('x-forwarded-for')?.split(',')[0],
    )

    createCookies(c, accessToken, refreshToken)

    return c.json({ message: 'Login successful' }, 200)
  })
  .openapi(AuthRoutes.refresh, async (c) => {
    const { auth: authService } = c.var.container.services
    const { cookie: cookieUtil } = c.var.container.utilities

    const refreshToken = cookieUtil.getRefreshToken(c)
    const { accessToken, refreshToken: newRefreshToken } = await authService.performRefresh(refreshToken)

    createCookies(c, accessToken, newRefreshToken)

    return c.json({ message: 'Tokens successfully refreshed' }, 200)
  })
  .openapi(AuthRoutes.signup, async (c) => {
    const { auth: authService } = c.var.container.services

    const payload = c.req.valid('json')
    const userAgent = c.req.header('User-Agent')
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]

    const { user, accessToken, refreshToken } = await authService.performSignup(payload, userAgent, ipAddress)

    createCookies(c, accessToken, refreshToken)

    return c.json(UserSelectSchema.parse(user), 201)
  })
