import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string(),

  // auth
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRY: z.coerce.number(),
  REFRESH_TOKEN_EXPIRY: z.coerce.number(),
})

// eslint-disable-next-line node/prefer-global/process
export const env = envSchema.parse(process.env)
