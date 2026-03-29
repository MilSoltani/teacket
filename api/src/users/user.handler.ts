import type { AppEnvironment } from '@api/lib/types'
import { OpenAPIHono, z } from '@hono/zod-openapi'
import { UserRoutes } from './user.routes'
import { UserSelectSchema } from './user.schema'
import { UserService } from './user.service'

export const UserHandler = new OpenAPIHono<AppEnvironment>()
  .openapi(UserRoutes.getAll, async (c) => {
    const data = await UserService.getAll()
    const parsedData = z.array(UserSelectSchema).parse(data)

    return c.json(parsedData, 200)
  })
  .openapi(UserRoutes.getById, async (c) => {
    const { id } = c.req.valid('param')

    const data = await UserService.getById(id)
    const parsedData = UserSelectSchema.parse(data)

    return c.json(parsedData, 200)
  })
  .openapi(UserRoutes.create, async (c) => {
    const data = c.req.valid('json')

    const user = await UserService.create(data)
    const parsedUser = UserSelectSchema.parse(user)

    return c.json(parsedUser, 201)
  })
  .openapi(UserRoutes.update, async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')

    const updatedUser = await UserService.update(id, data)
    const parsedData = UserSelectSchema.parse(updatedUser)

    return c.json(parsedData, 200)
  })
  .openapi(UserRoutes.delete, async (c) => {
    const { id } = c.req.valid('param')

    await UserService.delete(id)

    return c.body(null, 204)
  })
