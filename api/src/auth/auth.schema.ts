import { UserSelectSchema } from '@api/users'
import z from 'zod'

export type TokenType = 'access' | 'refresh'

export const LoginSchema = z.object({
  username: z.string().min(5).max(32),
  password: z.string().min(12).max(128),
})

export const AuthUserSchema = UserSelectSchema
  .pick({
    id: true,
    username: true,
  })
  .extend({
    password: z.string().min(8).max(255).nullable(),
  })
  .strict()

export const LoginResponseSchema = z.object({
  message: z.string(),
})

export type AuthUser = z.infer<typeof AuthUserSchema>
