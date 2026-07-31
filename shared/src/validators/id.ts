import { z } from 'zod'
import { OBJECT_ID_PATTERN } from '../constants/index.js'

/** Validates a MongoDB ObjectId (24-char hex string). */
export const idSchema = z.string().regex(OBJECT_ID_PATTERN, 'Must be a valid 24-char ObjectId')

/** Validates an optional MongoDB ObjectId. */
export const optionalIdSchema = idSchema.optional()
