import { env } from '../config/env.js'

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug'

type LogMeta = Record<string, unknown>

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

function isEnabled(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[env.LOG_LEVEL]
}

function format(level: LogLevel, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString()
  if (env.NODE_ENV === 'production') {
    return JSON.stringify({ level, message, timestamp, ...meta })
  }
  const metaSuffix = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] ${level.toUpperCase()} ${message}${metaSuffix}`
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!isEnabled(level)) {
    return
  }
  const line = format(level, message, meta)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

/** Minimal structured logger. Emits JSON lines in production, human-readable otherwise. */
export const logger = {
  debug: (message: string, meta?: LogMeta): void => write('debug', message, meta),
  http: (message: string, meta?: LogMeta): void => write('http', message, meta),
  info: (message: string, meta?: LogMeta): void => write('info', message, meta),
  warn: (message: string, meta?: LogMeta): void => write('warn', message, meta),
  error: (message: string, meta?: LogMeta): void => write('error', message, meta),
}
