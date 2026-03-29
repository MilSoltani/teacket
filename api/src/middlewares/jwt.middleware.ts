import type { JWTPayload } from 'hono/utils/jwt/types'

import { env } from '@api/env'
import { createMiddleware } from 'hono/factory'

import { jwt } from 'hono/jwt'

export interface AppJwtVariables {
  jwtPayload: JWTPayload
  userId: number
}

export const jwtMiddleware = createMiddleware(async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (['/login', '/signup'].some(p => path.endsWith(p))) {
    return next()
  }

  await jwt({
    secret: env.JWT_ACCESS_SECRET,
    alg: 'HS256',
    cookie: 'access',
  })(c, async () => {
    const payload = c.get('jwtPayload') as JWTPayload

    if (payload && payload.sub) {
      c.set('userId', payload.sub)
    }

    await next()
  })
})
