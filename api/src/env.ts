function requireEnv(key: string): string {
  // eslint-disable-next-line node/prefer-global/process
  const value = process.env[key]

  if (!value)
    throw new Error(`Missing required environment variable: ${key}`)

  return value
}

export const env = {
  NODE_ENV: requireEnv('NODE_ENV'),
  DATABASE_URL: requireEnv('DATABASE_URL'),
} as const
