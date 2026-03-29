import type { AppEnvironment } from '@api/lib/types'
import { SessionService } from '@api/sessions'
import { OpenAPIHono } from '@hono/zod-openapi'
import { AuthRoutes } from './auth.routes'
import { AuthService } from './auth.service'
import { CookieService } from './cookie.service'
import { CryptoService } from './crypto.service'
import { TokenService } from './token.service'

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
  .openapi(AuthRoutes.refresh, async (c) => {
    const refreshToken = CookieService.getRefreshToken(c)
    const refreshTokenPayload = await TokenService.verify(refreshToken, 'refresh')

    const sessionId = refreshTokenPayload.jti
    const session = await SessionService.getById(sessionId)

    AuthService.checkSessionValidity(session)

    const userId = refreshTokenPayload.sub
    const newAccessToken = await TokenService.generate(userId, 'access', sessionId)
    const newRefreshToken = await TokenService.generate(userId, 'refresh', sessionId)

    await SessionService.updateRefreshToken(sessionId, newRefreshToken)

    CookieService.create(c, 'access', newAccessToken, 'access')
    CookieService.create(c, 'refresh', refreshToken, 'refresh')

    return c.json({ message: 'Tokens successfully refresed' }, 200)
  })
