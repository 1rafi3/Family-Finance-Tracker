import type { LoanDirection, LoanStatus } from '../enums/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id, ISODateString, Money } from './common.js'

/**
 * A single borrowed-or-lent relationship owned by one member. Loan activity
 * never affects household income/expense totals (domain model §3.8).
 */
export interface Loan extends ArchivableEntity {
  /** The owning member. */
  ownerId: Id
  /** Whether the owner borrowed or lent the money. */
  direction: LoanDirection
  /** Name of the other party, 1–100 chars. */
  counterpartyName: string
  /** Original amount; always greater than zero. */
  principal: Money
  /** Optional annual interest rate as a percentage (0–100, decimal allowed). */
  interestRate?: number
  /** ISO 4217 currency code. `BDT` for V1. */
  currency: string
  /** Optional loan term in months (> 0). */
  termMonths?: number
  /** Optional due date. */
  dueDate?: ISODateString
  /** Outstanding balance; non-negative; `PAID` when `0.00`. */
  remainingBalance: Money
  /** Lifecycle status. */
  status: LoanStatus
  /** Optional free-text notes, max 500 chars. */
  notes?: string
}
