import type { userHandler } from '@api/users/user.handler'
import { hc } from 'hono/client'

export const UserClient = hc<typeof userHandler>('http://localhost:3000/api/users')
