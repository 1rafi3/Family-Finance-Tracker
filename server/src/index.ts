import dns from 'dns'
import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

dns.setServers(['1.1.1.1', '1.0.0.1'])

const SHUTDOWN_TIMEOUT_MS = 10_000

async function startServer(): Promise<void> {
  await connectDatabase()

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })

  let shuttingDown = false

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return
    }
    shuttingDown = true
    logger.info(`${signal} received, shutting down gracefully`)

    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit')
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)
    forceExit.unref()

    server.close((closeError) => {
      if (closeError) {
        logger.error('Error while closing HTTP server', { error: closeError.message })
      }
      void disconnectDatabase()
        .catch((error: unknown) => {
          logger.error('Error while disconnecting database', { error: error instanceof Error ? error.message : String(error) })
        })
        .finally(() => process.exit(0))
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: reason instanceof Error ? reason.message : String(reason) })
    process.exit(1)
  })

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack })
    process.exit(1)
  })
}

void startServer().catch((error: unknown) => {
  logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) })
  process.exit(1)
})
