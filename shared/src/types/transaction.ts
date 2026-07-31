import type { TransactionStatus, TransactionType } from '../enums/index.js'
import type { BaseEntity } from './base.js'
import type { Id, ISODateString, Money } from './common.js'

/**
 * The single source of truth for money movement: income, expense, or wallet
 * transfer. Its shape depends on `type` (domain model §3.3). Fields not
 * applicable to a given `type` are omitted (represented as absent, not `null`).
 */
export interface Transaction extends BaseEntity {
  /** Direction of the money movement. */
  type: TransactionType
  /** Lifecycle status. */
  status: TransactionStatus
  /** Amount; always positive — direction comes from `type`. */
  amount: Money
  /** ISO 4217 currency code. `BDT` for V1. */
  currency: string
  /** Wallet for INCOME/EXPENSE transactions; absent for TRANSFER. */
  walletId?: Id
  /** Source wallet for TRANSFER; absent otherwise. */
  sourceWalletId?: Id
  /** Destination wallet for TRANSFER; must differ from `sourceWalletId`. */
  destinationWalletId?: Id
  /** The owning member; may differ from `createdBy`. */
  ownerId: Id
  /** SubCategory for INCOME/EXPENSE; absent for TRANSFER. */
  subCategoryId?: Id
  /** Denormalized from `subCategoryId` for analytics; server-maintained. */
  superCategoryId?: Id
  /** Referenced tags, zero or more. */
  tagIds: Id[]
  /** Optional free-text notes, max 500 chars. */
  notes?: string
  /** Effective date of the transaction. */
  date: ISODateString
  /** The acting member who recorded the transaction; may differ from `ownerId`. */
  createdBy: Id
}
