import { z } from '@hono/zod-openapi'

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: { name: 'id', in: 'path' },
    example: 1,
  }),
})
