import type { Context } from 'hono'
import { z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod/v3'

export const ErrorSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export class NotFoundException extends HTTPException {
  constructor(resource: string) {
    super(404, { message: `${resource} not found` })
  }
}

export class InvalidCredentialsException extends HTTPException {
  constructor() {
    super(409, { message: `Invalid credentials` })
  }
}

export class UnauthenticatedException extends HTTPException {
  constructor(message: string = 'Invalid credentials') {
    super(401, { message })
  }
}

export class ForbiddenException extends HTTPException {
  constructor(message: string = 'Forbidden request') {
    super(403, { message })
  }
}

export function handleErrors(err: any, c: Context): Response {
  let status: number = 500
  let message: string = 'Internal server error'

  // Zod Validation Errors
  if (err instanceof ZodError) {
    status = 400
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
  }

  // Database Driver Errors (pg/postgreSQL)
  const dbErrors: Record<string, { message: string, status: number }> = {
    23505: { message: 'This item already exists', status: 409 },
    23503: { message: 'The referenced parent record was not found', status: 400 },
  }

  if (err.code && dbErrors[err.code]) {
    status = dbErrors[err.code].status
    message = dbErrors[err.code].message
  }

  // Hono Native & Custom Exceptions
  else if (err instanceof HTTPException) {
    status = err.status
    message = err.message
  }

  // General Runtime Errors
  else {
    console.error('[Unexpected Error]:', err)
  }

  return c.json({ success: false, message }, status as any)
}
