import type { BudgetPeriod } from '../enums/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id, Money } from './common.js'

export type BudgetTargetType = 'CATEGORY' | 'PERSON'
export type BudgetStatus = 'ON_TRACK' | 'WARNING' | 'EXCEEDED'

/**
 * A spending limit per EXPENSE Category or a monthly spending allowance per Person.
 */
export interface Budget extends ArchivableEntity {
  /** Account owner this budget belongs to. */
  ownerId: Id
  /** Optional custom title/label for the budget (e.g. "Aryan's Schooling & Books"). */
  name?: string
  /** Whether this budget targets a Category or a Beneficiary/Person. */
  targetType: BudgetTargetType
  /** The EXPENSE SuperCategory this budget applies to (optional if personId is set). */
  superCategoryId?: Id
  /** Optional granular SubCategory this budget applies to. */
  subCategoryId?: Id
  /** Optional Person / Dependent this allowance applies to. */
  personId?: Id
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

/** Budget enriched with real-time actual spending analytics for the period. */
export interface BudgetWithAnalytics extends Budget {
  spent: number
  remaining: number
  percentage: number
  transactionCount: number
  status: BudgetStatus
}

