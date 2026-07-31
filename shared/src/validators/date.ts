import { z } from 'zod'

/** Validates an ISO 8601 UTC timestamp string (e.g. `"2026-07-31T12:00:00.000Z"`). */
export const dateSchema = z.string().datetime('Must be a valid ISO 8601 UTC timestamp')

/** Validates an optional ISO 8601 UTC timestamp string. */
export const optionalDateSchema = dateSchema.optional()
