import { BudgetPeriod, SavingsGoalStatus, TransactionStatus, UserRole } from '../enums/index.js'

/** Application display name. */
export const APP_NAME = 'Family Finance Tracker'

/** Default role assigned when a new user is created without an explicit role. */
export const DEFAULT_USER_ROLE = UserRole.MEMBER

/** Default wallet type used when a wallet is created without an explicit type. */
export const DEFAULT_WALLET_TYPE = 'cash'

/**
 * Recommended wallet-type vocabulary. Additional types are allowed by design —
 * wallet `type` is a free-form string (domain model §3.2).
 */
export const WALLET_TYPES = ['cash', 'bank', 'bkash', 'nagad', 'rocket', 'houseCash'] as const

/** Default status applied to newly created transactions. */
export const DEFAULT_TRANSACTION_STATUS = TransactionStatus.COMPLETED

/** Default budget period applied when a budget is created without one. */
export const DEFAULT_BUDGET_PERIOD = BudgetPeriod.MONTHLY

/** Default status applied to newly created savings goals. */
export const DEFAULT_SAVINGS_GOAL_STATUS = SavingsGoalStatus.ACTIVE

/** Default status applied to newly created loans. */
export const DEFAULT_LOAN_STATUS = 'ACTIVE' as const
