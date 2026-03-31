import type { AppEnvironment } from '@api/lib/types'
import type { SignupPayload } from './auth.schema'
import { CookieService, CryptoService, JwtService } from '@api/lib/auth'
import { SessionService } from '@api/sessions'
import { UserSelectSchema } from '@api/users'
import { OpenAPIHono } from '@hono/zod-openapi'
import { AuthRepository } from './auth.repository'
import { AuthRoutes } from './auth.routes'
import { AuthService } from './auth.service'

export const AuthHandler = new OpenAPIHono<AppEnvironment>()
  .openapi(AuthRoutes.login, async (c) => {
    const { username, password } = c.req.valid('json')

    // Authenticate the user
    const authUser = await AuthService.authenticateUser(username, password)

    // Generate raw tokens (the strings that go to the user)
    const accessToken = await JwtService.generate(authUser.id, 'access')
    const refreshToken = await JwtService.generate(authUser.id, 'refresh')

    // HASH the refresh token before it touches the database
    const refreshTokenHash = CryptoService.sha256(refreshToken)

    // Create the session using the HASH
    const familyId = CryptoService.genUuid()
    const userAgent = c.req.header('User-Agent')
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]

    await SessionService.create(
      authUser.id,
      refreshTokenHash,
      userAgent,
      ipAddress,
      familyId,
    )

    // Send the RAW tokens to the user via cookies
    CookieService.create(c, 'access', accessToken, 'access')
    CookieService.create(c, 'refresh', refreshToken, 'refresh')

    return c.json({ message: 'Login successful' }, 200)
  })
  .openapi(AuthRoutes.refresh, async (c) => {
    const refreshToken = CookieService.getRefreshToken(c)

    // Hash the incoming token to look it up
    const hashedToken = CryptoService.sha256(refreshToken)
    const session = await SessionService.getSessionByHash(hashedToken)

    // Validate (This throws if expired, used or revoked -> revokes family)
    await SessionService.checkSessionValidity(session)

    // JWT Verify
    const payload = await JwtService.verify(refreshToken, 'refresh')
    const userId = payload.sub as number

    // Generate New Tokens
    const newAccessToken = await JwtService.generate(userId, 'access')
    const newRefreshToken = await JwtService.generate(userId, 'refresh')
    const newHashedToken = CryptoService.sha256(newRefreshToken)

    // Set session isUsed=true and create new one for same family
    await SessionService.rotateSession(session, newHashedToken)

    CookieService.create(c, 'access', newAccessToken, 'access')
    CookieService.create(c, 'refresh', newRefreshToken, 'refresh')

    return c.json({ message: 'Tokens successfully refreshed' }, 200)
  })
  .openapi(AuthRoutes.signup, async (c) => {
    const payload: SignupPayload = c.req.valid('json')

    const hashedPassword = await CryptoService.hash(payload.password)

    const user = await AuthRepository.create({
      ...payload,
      password: hashedPassword,
    })

    // Generate raw tokens (the strings that go to the user)
    const accessToken = await JwtService.generate(user.id, 'access')
    const refreshToken = await JwtService.generate(user.id, 'refresh')

    // HASH the refresh token before it touches the database
    const refreshTokenHash = CryptoService.sha256(refreshToken)

    // Create the session using the HASH
    const familyId = CryptoService.genUuid()
    const userAgent = c.req.header('User-Agent')
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0]

    await SessionService.create(
      user.id,
      refreshTokenHash,
      userAgent,
      ipAddress,
      familyId,
    )

    // Send the RAW tokens to the user via cookies
    CookieService.create(c, 'access', accessToken, 'access')
    CookieService.create(c, 'refresh', refreshToken, 'refresh')

    const parsedUser = UserSelectSchema.parse(user)

    return c.json(parsedUser, 201)
  })
