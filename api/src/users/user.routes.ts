import { IdParamSchema } from '@api/lib/common.schema'
import { ErrorSchema } from '@api/lib/errors'
import { createRoute, z } from '@hono/zod-openapi'
import { UserInsertSchema, UserSelectSchema, UserUpdateSchema } from './user.schema'

export const UserRoutes = {
  getAll: createRoute({
    method: 'get',
    path: '/',
    tags: ['User'],
    responses: {
      200: {
        content: { 'application/json': { schema: z.array(UserSelectSchema) } },
        description: 'List of all users',
      },
    },
  }),

  getById: createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['User'],
    request: { params: IdParamSchema },
    responses: {
      200: {
        content: { 'application/json': { schema: UserSelectSchema } },
        description: 'The requested user',
      },
      404: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'User not found',
      },
    },
  }),

  create: createRoute({
    method: 'post',
    path: '/',
    tags: ['User'],
    request: {
      body: { content: { 'application/json': { schema: UserInsertSchema } } },
    },
    responses: {
      201: {
        content: { 'application/json': { schema: UserSelectSchema } },
        description: 'User created successfully',
      },
      400: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'Validation failed or invalid references',
      },
      409: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'User already exists (Unique constraint)',
      },
    },
  }),

  update: createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['User'],
    request: {
      params: IdParamSchema,
      body: { content: { 'application/json': { schema: UserUpdateSchema } } },
    },
    responses: {
      200: {
        content: { 'application/json': { schema: UserSelectSchema } },
        description: 'User updated successfully',
      },
      400: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'Invalid input data',
      },
      404: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'User not found',
      },
    },
  }),

  delete: createRoute({
    method: 'delete',
    path: '/{id}',
    tags: ['User'],
    request: { params: IdParamSchema },
    responses: {
      204: {
        description: 'User deleted successfully',
      },
      404: {
        content: { 'application/json': { schema: ErrorSchema } },
        description: 'User not found',
      },
    },
  }),
}
