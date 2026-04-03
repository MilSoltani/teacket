import type { AuthHandler } from '@api/auth'
import type { UserHandler } from '@api/users'
import { hc } from 'hono/client'

export const UserClient = hc<UserHandler>('http://localhost:3000/api/users')
export const AuthClient = hc<AuthHandler>('http://localhost:3000/api/auth')
