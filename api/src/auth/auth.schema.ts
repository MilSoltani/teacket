import { UserSelectSchema } from '@api/users'
import z from 'zod'

export type TokenType = 'access' | 'refresh'

export const LoginSchema = UserSelectSchema.pick({
  username: true,
}).extend({
  password: z.string().min(12).max(128),
}).strict()

export const SignupSchema = UserSelectSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
}).extend({
  password: z.string().min(12).max(128),
}).strict()

export const AuthSuccessResponse = z.object({
  message: z.string(),
})

export type LoginPayload = z.infer<typeof LoginSchema>
export type SignupPayload = z.infer<typeof SignupSchema>

export interface AuthUser {
  id: number
  username: string
  password: string
}
