import { Hono } from 'hono'
import { trpcServer } from '@hono/trpc-server'
import { createTRPCContext, appRouter as router } from '@a/api'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { authHandler, initAuthConfig, verifyAuth, type AuthConfig } from '@hono/auth-js'
import Google from '@auth/core/providers/google'

const app = new Hono().basePath('/')

app
  .use(
    '*',
    cors({
      origin: origin => origin,
      allowHeaders: ['Content-Type'],
      credentials: true
    })
  )
  .use(
    '*',
    initAuthConfig((c): AuthConfig => {
      return {
        secret: c.env.AUTH_SECRET,
        providers: [
          Google({
            clientId: c.env.GOOGLE_CLIENT_ID,
            clientSecret: c.env.GOOGLE_CLIENT_SECRET
          })
        ]
      }
    })
  )
  .use('/api/auth/*', authHandler())
  .use('/api/*', verifyAuth())
  .use(
    '/trpc/*',
    trpcServer({
      router,
      createContext: (opts, c) =>
        createTRPCContext({
          session: c.get('authUser').session,
          headers: opts.resHeaders
        }),
      onError({ error, path }) {
        console.error(`>>> tRPC Error on '${path}'`, error)
      }
    })
  )
  .get('/ui', swaggerUI({ url: '/doc' }))

export default {
  port: 2999,
  fetch: app.fetch
}

export type App = typeof app
