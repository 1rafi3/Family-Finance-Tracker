import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import { apiRateLimiter } from '../middleware/rateLimiter.js'

export const apiRouter = Router()

apiRouter.use(apiRateLimiter)

apiRouter.get('/health', (_req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  })
})
