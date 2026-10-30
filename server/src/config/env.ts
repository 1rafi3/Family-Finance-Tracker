import 'dotenv/config'
import { z } from 'zod'

const INSECURE_JWT_SECRET = 'development-only-secret-change-me'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'http', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .default(INSECURE_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

// Production security guards — fail fast if insecure defaults are in use
if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET === INSECURE_JWT_SECRET) {
    console.error(
      '[SECURITY] JWT_SECRET is set to the insecure development default. ' +
        'Set a strong random secret (≥32 chars) before running in production.',
    )
    process.exit(1)
  }
  if (env.CORS_ORIGIN === 'http://localhost:5173') {
    console.warn(
      '[SECURITY] CORS_ORIGIN is set to the localhost default in production. ' +
        'Set CORS_ORIGIN to your deployed frontend URL.',
    )
  }
}
