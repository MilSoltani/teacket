import type { createUserService } from './user.service'
import { OpenAPIHono, z } from '@hono/zod-openapi'
import { UserRoutes } from './user.routes'
import { UserSelectSchema } from './user.schema'

export interface UserHandlerDeps {
  userService: ReturnType<typeof createUserService>
}

/** Handler for user routes. */
export function createUserHandler({ userService }: UserHandlerDeps) {
  return new OpenAPIHono()
    /** Returns all users. */
    .openapi(UserRoutes.getAll, async (c) => {
      const data = await userService.getAll()
      const parsedData = z.array(UserSelectSchema).parse(data)

      return c.json(parsedData, 200)
    })
    /** Returns one user by id. */
    .openapi(UserRoutes.getById, async (c) => {
      const { id } = c.req.valid('param')

      const data = await userService.getById(id)
      const parsedData = UserSelectSchema.parse(data)

      return c.json(parsedData, 200)
    })
    /** Creates a user. */
    .openapi(UserRoutes.create, async (c) => {
      const data = c.req.valid('json')

      const user = await userService.create(data)
      const parsedUser = UserSelectSchema.parse(user)

      return c.json(parsedUser, 201)
    })
    /** Updates a user. */
    .openapi(UserRoutes.update, async (c) => {
      const { id } = c.req.valid('param')
      const data = c.req.valid('json')

      const updatedUser = await userService.update(id, data)
      const parsedData = UserSelectSchema.parse(updatedUser)

      return c.json(parsedData, 200)
    })
    /** Deletes a user. */
    .openapi(UserRoutes.delete, async (c) => {
      const { id } = c.req.valid('param')

      await userService.delete(id)

      return c.body(null, 204)
    })
}

export type UserHandler = ReturnType<typeof createUserHandler>
