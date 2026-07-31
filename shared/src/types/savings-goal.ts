import type { SavingsGoalStatus } from '../enums/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id, ISODateString, Money } from './common.js'

/**
 * A personal savings target with progress tracking. Progress percentage is
 * derived (`currentAmount / targetAmount × 100`), never stored (domain §3.7).
 */
export interface SavingsGoal extends ArchivableEntity {
  /** The owning member. */
  ownerId: Id
  /** Display name, 1–50 chars. */
  name: string
  /** Target amount; always greater than zero. */
  targetAmount: Money
  /** Current saved amount; non-negative. */
  currentAmount: Money
  /** ISO 4217 currency code. `BDT` for V1. */
  currency: string
  /** Optional target date; may be in the future. */
  deadline?: ISODateString
  /** Lifecycle status. */
  status: SavingsGoalStatus
  /** Optional free-text notes, max 500 chars. */
  notes?: string
}
