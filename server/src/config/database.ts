import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'
import { env } from './env.js'

const DEFAULT_RETRIES = 3
const RETRY_DELAY_MS = 2000

const DATABASE_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

export interface DatabaseConnectionOptions {
  retries?: number
  retryDelayMs?: number
}

export function configureDatabaseEvents(): void {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'))
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', { error: error instanceof Error ? error.message : String(error) })
  })
}

export async function connectDatabase(options: DatabaseConnectionOptions = {}): Promise<void> {
  const { retries = DEFAULT_RETRIES, retryDelayMs = RETRY_DELAY_MS } = options

  mongoose.set('strictQuery', true)
  configureDatabaseEvents()

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI)
      logger.info('MongoDB connected', { database: mongoose.connection.name })
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (attempt < retries) {
        logger.warn(`MongoDB connection attempt ${attempt}/${retries} failed, retrying`, { error: message })
        await delay(retryDelayMs)
      } else {
        logger.error(`MongoDB connection failed after ${retries} attempts`, { error: message })
        throw error
      }
    }
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1
}

export function getDatabaseStatus(): { state: number; status: string } {
  return { state: mongoose.connection.readyState, status: DATABASE_STATES[mongoose.connection.readyState] }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return
  }
  await mongoose.disconnect()
  logger.info('MongoDB disconnected')
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
