import { z } from 'zod'
import { currencySchema, nameSchema, walletTypeSchema } from '@family-finance/shared'
import { DEFAULT_CURRENCY, DEFAULT_WALLET_TYPE } from '@family-finance/shared'

export const walletCreateSchema = z
  .object({
    name: nameSchema,
    type: walletTypeSchema.default(DEFAULT_WALLET_TYPE),
    currency: currencySchema.default(DEFAULT_CURRENCY),
  })
  .strict()

export type WalletCreateInput = z.infer<typeof walletCreateSchema>

export const walletUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    type: walletTypeSchema.optional(),
    currency: currencySchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.name === undefined && data.type === undefined && data.currency === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide at least one of name, type or currency' })
    }
  })

export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>
