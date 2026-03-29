import type { TokenType } from '@api/auth'

import type { Context } from 'hono'
import { env } from '@api/env'
import { setCookie } from 'hono/cookie'

export const CookieService = {
  async create(
    c: Context,
    name: string,
    value: string,
    tokenType: TokenType,
  ) {
    const secure = env.NODE_ENV === 'production'
    const sameSite = secure ? 'Strict' : 'Lax'
    const path = tokenType === 'access' ? '/' : '/api/refresh'
    const maxAge = tokenType === 'access' ? env.ACCESS_TOKEN_EXPIRY : env.REFRESH_TOKEN_EXPIRY

    setCookie(c, name, value, {
      httpOnly: true,
      secure,
      sameSite,
      path,
      maxAge,
    })
  },
}
