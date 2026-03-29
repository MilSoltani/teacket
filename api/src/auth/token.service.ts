import type { TokenPayload, TokenType } from './auth.schema'
import { env } from '@api/env'
import { UnauthenticatedException } from '@api/lib/errors'
import { sign, verify } from 'hono/jwt'

export const TokenService = {
  async generate(
    sub: number,
    type: TokenType,
    jti: string,
  ): Promise<string> {
    const iat = Math.floor(Date.now() / 1000)

    const expireIn = type === 'access'
      ? env.ACCESS_TOKEN_EXPIRY
      : env.REFRESH_TOKEN_EXPIRY

    const exp = iat + expireIn
    const payload = { sub, iat, exp, jti }

    const secret = type === 'access'
      ? env.JWT_ACCESS_SECRET
      : env.JWT_REFRESH_SECRET

    return await sign(payload, secret, 'HS256')
  },

  async verify(token: string, type: 'access' | 'refresh'): Promise<TokenPayload> {
    try {
      const secret = type === 'access'
        ? env.JWT_ACCESS_SECRET
        : env.JWT_REFRESH_SECRET
      return await verify(token, secret, 'HS256') as TokenPayload
    }
    catch {
      throw new UnauthenticatedException('Invalid or expired token')
    }
  },
}
