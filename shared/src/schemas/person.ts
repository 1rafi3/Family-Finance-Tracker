import { z } from 'zod'
import { nameSchema } from '../validators/index.js'

/** Validates creation of a Person / Dependent profile. */
export const createPersonSchema = z
  .object({
    name: nameSchema,
    relationship: z.string().min(1, 'Relationship is required').max(50),
    color: z.string().optional(),
    avatar: z.string().optional(),
    notes: z.string().max(300).optional(),
  })
  .strict()

export type CreatePersonInput = z.infer<typeof createPersonSchema>

/** Validates an update to a Person profile. */
export const updatePersonSchema = z
  .object({
    name: nameSchema.optional(),
    relationship: z.string().min(1).max(50).optional(),
    color: z.string().optional(),
    avatar: z.string().optional(),
    notes: z.string().max(300).optional(),
    isArchived: z.boolean().optional(),
  })
  .strict()

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>

/** Validates query params when listing people. */
export const personQuerySchema = z.object({
  search: z.string().optional(),
  isArchived: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

export type PersonQueryInput = z.infer<typeof personQuerySchema>
