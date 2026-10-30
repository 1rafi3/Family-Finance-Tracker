import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

/**
 * Stricter rate limiter for authentication endpoints (login, register).
 * These routes run bcrypt (CPU-intensive) and are prime brute-force targets.
 * Limit: 10 requests per 15-minute window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
})

