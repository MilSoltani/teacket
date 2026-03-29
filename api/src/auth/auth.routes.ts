import { createRoute } from '@hono/zod-openapi'
import { LoginResponseSchema, LoginSchema } from './auth.schema'

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
            schema: LoginResponseSchema,
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

  logout: createRoute({
    method: 'post',
    path: '/logout',
    tags: ['Auth'],
    responses: {
      204: {
        content: {},
        description: 'Logout successful, refresh token revoked (no content)',
      },
      401: {
        content: {},
        description: 'Invalid or missing refresh token',
      },
    },
  }),

  signup: createRoute({
    method: 'post',
    path: '/signup',
    tags: ['Auth'],
    responses: {
      201: {
        content: {},
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
        content: {},
        description: 'Returns new access token',
      },
      401: {
        content: {},
        description: 'Invalid or expired refresh token',
      },
    },
  }),
}
