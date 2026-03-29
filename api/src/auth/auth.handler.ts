import type { AppEnvironment } from '@api/lib/types'
import { AuthService, CookieService, TokenService } from '@api/auth'
import { SessionService } from '@api/sessions'
import { OpenAPIHono } from '@hono/zod-openapi'
import { AuthRoutes } from './auth.routes'
import { CryptoService } from './crypto.service'

export const AuthHandler = new OpenAPIHono<AppEnvironment>()
  .openapi(AuthRoutes.login, async (c) => {
    const { username, password } = c.req.valid('json')

    const userAgent = c.req.header('User-Agent')
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]

    const authUser = await AuthService.getAuthUser(username, password)

    const sessionId = CryptoService.genUuid()

    const accessToken = await TokenService.generate(authUser.id, 'access', sessionId)
    const refreshToken = await TokenService.generate(authUser.id, 'refresh', sessionId)

    await SessionService.create(sessionId, authUser.id, refreshToken, userAgent, ipAddress)

    CookieService.create(c, 'access', accessToken, 'access')
    CookieService.create(c, 'refresh', refreshToken, 'refresh')

    return c.json({ message: 'Login successful' }, 200)
  })
