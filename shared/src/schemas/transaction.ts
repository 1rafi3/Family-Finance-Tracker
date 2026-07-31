import { z } from 'zod'
import {
  DEFAULT_CURRENCY,
  DEFAULT_TRANSACTION_STATUS,
  MAX_TAGS_PER_TRANSACTION,
} from '../constants/index.js'
import { TransactionStatus, TransactionType } from '../enums/index.js'
import type { Id, Transaction } from '../types/index.js'
import {
  currencySchema,
  dateSchema,
  idSchema,
  notesSchema,
  positiveMoneySchema,
} from '../validators/index.js'

/** Subset of the transaction shape needed by the type-dependent validation. */
interface TransactionShapeInput {
  type?: TransactionType
  walletId?: Id
  sourceWalletId?: Id
  destinationWalletId?: Id
  subCategoryId?: Id
}

/**
 * Enforces the type-dependent shape of a transaction (domain model §3.3):
 * INCOME/EXPENSE require `walletId` + `subCategoryId`; TRANSFER requires
 * distinct `sourceWalletId` + `destinationWalletId`.
 */
function validateTransactionShape(data: TransactionShapeInput, ctx: z.RefinementCtx): void {
  const { type, walletId, sourceWalletId, destinationWalletId, subCategoryId } = data

  if (type === TransactionType.INCOME || type === TransactionType.EXPENSE) {
    if (!walletId) {
      ctx.addIssue({
        code: 'custom',
        path: ['walletId'],
        message: 'Required for INCOME/EXPENSE transactions',
      })
    }
    if (!subCategoryId) {
      ctx.addIssue({
        code: 'custom',
        path: ['subCategoryId'],
        message: 'Required for INCOME/EXPENSE transactions',
      })
    }
    return
  }

  if (type === TransactionType.TRANSFER) {
    if (!sourceWalletId) {
      ctx.addIssue({
        code: 'custom',
        path: ['sourceWalletId'],
        message: 'Required for TRANSFER transactions',
      })
    }
    if (!destinationWalletId) {
      ctx.addIssue({
        code: 'custom',
        path: ['destinationWalletId'],
        message: 'Required for TRANSFER transactions',
      })
    }
    if (sourceWalletId && sourceWalletId === destinationWalletId) {
      ctx.addIssue({
        code: 'custom',
        path: ['destinationWalletId'],
        message: 'Must differ from sourceWalletId',
      })
    }
  }
}

const transactionShape = {
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  amount: positiveMoneySchema,
  currency: currencySchema,
  walletId: idSchema.optional(),
  sourceWalletId: idSchema.optional(),
  destinationWalletId: idSchema.optional(),
  ownerId: idSchema,
  subCategoryId: idSchema.optional(),
  tagIds: z.array(idSchema),
  notes: notesSchema.optional(),
  date: dateSchema,
}

/** Validates creation of a transaction. Shape depends on `type`. */
export const transactionCreateSchema = z
  .object({
    ...transactionShape,
    status: z.nativeEnum(TransactionStatus).default(DEFAULT_TRANSACTION_STATUS),
    currency: currencySchema.default(DEFAULT_CURRENCY),
    tagIds: z.array(idSchema).max(MAX_TAGS_PER_TRANSACTION).default([]),
  })
  .strict()
  .superRefine(validateTransactionShape)

/** Input type of {@link transactionCreateSchema}. */
export type TransactionCreateInput = z.input<typeof transactionCreateSchema>

/** Validates an update to a transaction. Shape depends on `type`. */
export const transactionUpdateSchema = z
  .object({ ...transactionShape })
  .partial()
  .strict()
  .superRefine(validateTransactionShape)

/** Input type of {@link transactionUpdateSchema}. */
export type TransactionUpdateInput = z.input<typeof transactionUpdateSchema>

/** Validates a `Transaction` resource. */
export const transactionSchema: z.ZodType<Transaction> = z.object({
  id: idSchema,
  type: z.nativeEnum(TransactionType),
  status: z.nativeEnum(TransactionStatus),
  amount: positiveMoneySchema,
  currency: currencySchema,
  walletId: idSchema.optional(),
  sourceWalletId: idSchema.optional(),
  destinationWalletId: idSchema.optional(),
  ownerId: idSchema,
  subCategoryId: idSchema.optional(),
  superCategoryId: idSchema.optional(),
  tagIds: z.array(idSchema),
  notes: notesSchema.optional(),
  date: dateSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema,
})
