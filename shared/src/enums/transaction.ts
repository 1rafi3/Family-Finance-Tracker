/**
 * Direction of a transaction's money movement.
 * - `INCOME`: money flowing into the household.
 * - `EXPENSE`: money flowing out of the household.
 * - `TRANSFER`: wallet-to-wallet movement; never income or expense.
 */
export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  TRANSFER: 'TRANSFER',
} as const

/** Union type of all {@link TransactionType} values. */
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

/**
 * Lifecycle status of a transaction.
 * - `COMPLETED`: effective, balance applied (default).
 * - `PENDING`: recorded but not yet effective.
 * - `CANCELLED`: voided; balance reversed. Terminal state.
 */
export const TransactionStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
} as const

/** Union type of all {@link TransactionStatus} values. */
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus]
