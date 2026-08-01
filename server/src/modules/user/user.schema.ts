import { z } from 'zod'
import { nameSchema } from '@family-finance/shared'

export const updateProfileSchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.firstName === undefined && data.lastName === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide at least one of firstName or lastName' })
    }
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updateStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict()

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
