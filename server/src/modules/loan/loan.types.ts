import type { LoanCreateInput, LoanUpdateInput } from '@family-finance/shared'

export interface LoanCreateData extends LoanCreateInput {
  ownerId: string
  remainingBalance?: string
}

export interface LoanUpdateData extends LoanUpdateInput {}
