import { z } from 'zod'
import type { Tag } from '../types/index.js'
import { dateSchema, idSchema, nonNegativeIntSchema, tagNameSchema } from '../validators/index.js'

/** Validates creation of a tag. `usageCount` is server-managed. */
export const tagCreateSchema = z
  .object({
    name: tagNameSchema,
  })
  .strict()

/** Input type of {@link tagCreateSchema}. */
export type TagCreateInput = z.input<typeof tagCreateSchema>

/** Validates an update to a tag. `usageCount` is server-managed. */
export const tagUpdateSchema = z
  .object({
    name: tagNameSchema.optional(),
  })
  .strict()

/** Input type of {@link tagUpdateSchema}. */
export type TagUpdateInput = z.input<typeof tagUpdateSchema>

/** Validates a `Tag` resource. */
export const tagSchema: z.ZodType<Tag> = z.object({
  id: idSchema,
  name: tagNameSchema,
  usageCount: nonNegativeIntSchema,
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
