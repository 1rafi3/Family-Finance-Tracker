import type { BudgetPeriod } from '../enums/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id, Money } from './common.js'

/**
 * A family-wide spending limit per EXPENSE SuperCategory per period.
 * Monthly budgets are V1; yearly is future expansion (domain model §3.6).
 */
export interface Budget extends ArchivableEntity {
  /** The EXPENSE SuperCategory this budget applies to. */
  superCategoryId: Id
  /** Spending limit; always greater than zero. */
  amount: Money
  /** ISO 4217 currency code. `BDT` for V1. */
  currency: string
  /** Recurrence period. `MONTHLY` in V1. */
  period: BudgetPeriod
  /** Period year, e.g. `2026`. */
  periodYear: number
  /** Period month 1–12; required when `period` is `MONTHLY`. */
  periodMonth?: number
}
