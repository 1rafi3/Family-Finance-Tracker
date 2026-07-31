import { z } from 'zod'
import { DEFAULT_CURRENCY, DEFAULT_WALLET_TYPE } from '../constants/index.js'
import type { Wallet } from '../types/index.js'
import {
  currencySchema,
  dateSchema,
  idSchema,
  moneySchema,
  nameSchema,
  walletTypeSchema,
} from '../validators/index.js'

/** Validates creation of a wallet. `balance` is server-managed and not accepted. */
export const walletCreateSchema = z
  .object({
    ownerId: idSchema,
    name: nameSchema,
    type: walletTypeSchema.default(DEFAULT_WALLET_TYPE),
    currency: currencySchema.default(DEFAULT_CURRENCY),
  })
  .strict()

/** Input type of {@link walletCreateSchema}. */
export type WalletCreateInput = z.input<typeof walletCreateSchema>

/** Validates an update to a wallet. `balance` is read-only. */
export const walletUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    type: walletTypeSchema.optional(),
    currency: currencySchema.optional(),
  })
  .strict()

/** Input type of {@link walletUpdateSchema}. */
export type WalletUpdateInput = z.input<typeof walletUpdateSchema>

/** Validates a `Wallet` resource. */
export const walletSchema: z.ZodType<Wallet> = z.object({
  id: idSchema,
  ownerId: idSchema,
  name: nameSchema,
  type: walletTypeSchema,
  currency: currencySchema,
  balance: moneySchema,
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
