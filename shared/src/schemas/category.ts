import { z } from 'zod'
import { CategoryType } from '../enums/index.js'
import type { SubCategory, SuperCategory } from '../types/index.js'
import { dateSchema, idSchema, nameSchema } from '../validators/index.js'

/** Validates creation of a SuperCategory (ADMIN only). `type` is fixed at creation. */
export const superCategoryCreateSchema = z
  .object({
    name: nameSchema,
    type: z.nativeEnum(CategoryType),
  })
  .strict()

/** Input type of {@link superCategoryCreateSchema}. */
export type SuperCategoryCreateInput = z.input<typeof superCategoryCreateSchema>

/** Validates an update to a SuperCategory. `type` is immutable. */
export const superCategoryUpdateSchema = z
  .object({
    name: nameSchema.optional(),
  })
  .strict()

/** Input type of {@link superCategoryUpdateSchema}. */
export type SuperCategoryUpdateInput = z.input<typeof superCategoryUpdateSchema>

/** Validates a `SuperCategory` resource. */
export const superCategorySchema: z.ZodType<SuperCategory> = z.object({
  id: idSchema,
  name: nameSchema,
  type: z.nativeEnum(CategoryType),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})

/** Validates creation of a SubCategory (any member). `type` must match the parent. */
export const subCategoryCreateSchema = z
  .object({
    superCategoryId: idSchema,
    name: nameSchema,
    type: z.nativeEnum(CategoryType),
  })
  .strict()

/** Input type of {@link subCategoryCreateSchema}. */
export type SubCategoryCreateInput = z.input<typeof subCategoryCreateSchema>

/** Validates an update to a SubCategory. `type` is immutable. */
export const subCategoryUpdateSchema = z
  .object({
    name: nameSchema.optional(),
  })
  .strict()

/** Input type of {@link subCategoryUpdateSchema}. */
export type SubCategoryUpdateInput = z.input<typeof subCategoryUpdateSchema>

/** Validates a `SubCategory` resource. */
export const subCategorySchema: z.ZodType<SubCategory> = z.object({
  id: idSchema,
  superCategoryId: idSchema,
  name: nameSchema,
  type: z.nativeEnum(CategoryType),
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
