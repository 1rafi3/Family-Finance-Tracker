/**
 * Direction of a loan from the owner's perspective.
 * - `BORROWED`: the owner borrowed money.
 * - `LENT`: the owner lent money.
 */
export const LoanDirection = {
  BORROWED: 'BORROWED',
  LENT: 'LENT',
} as const

/** Union type of all {@link LoanDirection} values. */
export type LoanDirection = (typeof LoanDirection)[keyof typeof LoanDirection]

/**
 * Lifecycle status of a loan.
 * - `ACTIVE`: outstanding balance remains.
 * - `PAID`: fully repaid (`remainingBalance` is 0).
 * - `OVERDUE`: past due date with an outstanding balance.
 * - `CANCELLED`: agreement voided manually.
 */
export const LoanStatus = {
  ACTIVE: 'ACTIVE',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const

/** Union type of all {@link LoanStatus} values. */
export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus]
