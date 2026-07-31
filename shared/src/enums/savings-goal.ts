/**
 * Lifecycle status of a savings goal.
 * - `ACTIVE`: goal in progress.
 * - `COMPLETED`: target reached; progress is read-only.
 * - `CANCELLED`: manually cancelled; progress is read-only.
 */
export const SavingsGoalStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

/** Union type of all {@link SavingsGoalStatus} values. */
export type SavingsGoalStatus = (typeof SavingsGoalStatus)[keyof typeof SavingsGoalStatus]
