import { z } from 'zod'
import {
  cursorPaginationQuerySchema,
  idSchema,
  moneySchema,
  transactionCreateSchema,
  transactionUpdateSchema,
  TransactionStatus,
  TransactionType,
} from '@family-finance/shared'

/** Input types of the shared transaction schemas (post-validation, defaults applied). */
export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>

/** Matches either a full ISO 8601 timestamp or a bare `YYYY-MM-DD` date. */
const queryDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/, 'Must be a valid date (YYYY-MM-DD or ISO 8601)')

const optionalId = idSchema.optional()

/**
 * Cursor-paginated ledger query (API contract §7.1 / §7.3). Unknown parameters
 * are ignored for forward compatibility; `page`/`limit` offset params are not
 * supported for transactions.
 */
export const transactionListQuerySchema = z
  .object({
    ...cursorPaginationQuerySchema.shape,
    type: z.nativeEnum(TransactionType).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    ownerId: optionalId,
    walletId: optionalId,
    superCategoryId: optionalId,
    subCategoryId: optionalId,
    tagIds: z.string().optional(),
    dateFrom: queryDateSchema.optional(),
    dateTo: queryDateSchema.optional(),
    amountFrom: moneySchema.optional(),
    amountTo: moneySchema.optional(),
    search: z.string().trim().max(500).optional(),
  })

/** Input type of {@link transactionListQuerySchema}. */
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
