import type { SavingsGoalCreateInput, SavingsGoalUpdateInput } from '@family-finance/shared'

export interface SavingsGoalCreateData extends SavingsGoalCreateInput {
  ownerId: string
}

export interface SavingsGoalUpdateData extends SavingsGoalUpdateInput {}
