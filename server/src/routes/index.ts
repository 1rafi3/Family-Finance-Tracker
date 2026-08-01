import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { APP_NAME } from '@family-finance/shared'
import { env } from '../config/env.js'
import { APP_VERSION } from '../config/version.js'
import { getDatabaseStatus, isDatabaseConnected } from '../config/database.js'
import { apiRateLimiter } from '../middleware/rateLimiter.js'
import { authRouter } from '../modules/auth/index.js'
import { success } from '../utils/ApiResponse.js'

export const apiRouter = Router()

apiRouter.use(apiRateLimiter)

apiRouter.use('/auth', authRouter)

apiRouter.get('/health', (_req, res) => {
  const connected = isDatabaseConnected()
  const database = getDatabaseStatus()

  res.status(connected ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE).json(
    success({
      status: connected ? 'ok' : 'degraded',
      application: { name: APP_NAME, version: APP_VERSION, environment: env.NODE_ENV },
      uptime: process.uptime(),
      database,
      timestamp: new Date().toISOString(),
    }),
  )
})
