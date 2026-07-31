import morgan from 'morgan'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

/** Request logging via morgan, routed through the application logger. */
export const requestLogger = morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim())
    },
  },
})
