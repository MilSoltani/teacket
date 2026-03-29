import type { Context } from 'hono'
import type { TokenType } from './auth.schema'
import { env } from '@api/env'
import { UnauthenticatedException } from '@api/lib/errors'
import { getCookie, setCookie } from 'hono/cookie'

export const CookieService = {
  async create(
    c: Context,
    name: string,
    value: string,
    tokenType: TokenType,
  ) {
    const secure = env.NODE_ENV === 'production'
    const sameSite = secure ? 'Strict' : 'Lax'
    const path = tokenType === 'access' ? '/auth' : '/api/auth/refresh'
    const maxAge = tokenType === 'access' ? env.ACCESS_TOKEN_EXPIRY : env.REFRESH_TOKEN_EXPIRY

    setCookie(c, name, value, {
      httpOnly: true,
      secure,
      sameSite,
      path,
      maxAge,
    })
  },

  getRefreshToken(c: Context): string {
    const refreshToken = getCookie(c, 'refresh')

    if (!refreshToken) {
      throw new UnauthenticatedException('Invalid or expired refresh token')
    }

    return refreshToken
  },
}
