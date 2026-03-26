import type { AppEnvironment } from './lib/types'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { handleErrors } from './lib/errors'
import { userHandler } from './users/user.handler'

const app = new OpenAPIHono<AppEnvironment>()

app.use(logger())
app.use('/*', cors())
app.get('/api/health', c => c.json({ ok: true }))

app.route('/api/users', userHandler)

app.onError(handleErrors)
app.notFound(c => c.json({ message: 'Not Found' }, 404))

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'Teacket API',
    version: '1.0.0',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))

serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  // eslint-disable-next-line no-console
  console.log(`Server on http://localhost:${info.port}`)
})
