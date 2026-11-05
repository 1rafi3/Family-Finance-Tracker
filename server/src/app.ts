import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFound, requestLogger } from './middleware/index.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (
          env.CORS_ORIGIN === '*' ||
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          /^https:\/\/family-finance-tracker.*\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true)
        }
        return callback(null, false)
      },
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use(requestLogger)

  app.use('/api', apiRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
