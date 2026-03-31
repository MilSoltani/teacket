import { UserSelectSchema } from '@api/users'
import { createRoute } from '@hono/zod-openapi'
import { AuthSuccessResponse, LoginSchema, SignupSchema } from './auth.schema'

export const AuthRoutes = {
  login: createRoute({
    method: 'post',
    path: '/login',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': { schema: LoginSchema },
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: AuthSuccessResponse,
          },
        },
        description: 'Login successful, returns access and refresh tokens',
      },
      401: {
        content: {},
        description: 'Invalid credentials',
      },
    },
  }),

  signup: createRoute({
    method: 'post',
    path: '/signup',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': { schema: SignupSchema },
        },
      },
    },
    responses: {
      201: {
        content: {
          'application/json': { schema: UserSelectSchema },
        },
        description: 'Signup successful, returns access and refresh tokens',
      },
      400: {
        content: {},
        description: 'Invalid input',
      },
      409: {
        content: {},
        description: 'User already exists',
      },
    },
  }),

  refresh: createRoute({
    method: 'post',
    path: '/refresh',
    tags: ['Auth'],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: AuthSuccessResponse,
          },
        },
        description: 'Returns new access token',
      },
      401: {
        content: {},
        description: 'Invalid or expired refresh token',
      },
    },
  }),
}
