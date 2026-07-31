/**
 * Recurrence period of a budget.
 * - `MONTHLY`: V1 budget period.
 * - `YEARLY`: future expansion.
 */
export const BudgetPeriod = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const

/** Union type of all {@link BudgetPeriod} values. */
export type BudgetPeriod = (typeof BudgetPeriod)[keyof typeof BudgetPeriod]
