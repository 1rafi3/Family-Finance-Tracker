import type { CategoryType } from '../enums/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id } from './common.js'

/**
 * Top-level grouping of categories used for analytics, budgets, and reports.
 * The first level of the two-level category system (domain model §3.4).
 */
export interface SuperCategory extends ArchivableEntity {
  /** Display name, 1–50 chars; unique per `type`, case-insensitive. */
  name: string
  /** `INCOME` or `EXPENSE`; fixed at creation. */
  type: CategoryType
  /** `true` for system-seeded categories. */
  isSystem: boolean
}

/**
 * Specific value under a SuperCategory. The second level of the two-level
 * category system; every transaction is categorized to a SubCategory and its
 * SuperCategory is derived (domain model §3.5).
 */
export interface SubCategory extends ArchivableEntity {
  /** The parent SuperCategory. */
  superCategoryId: Id
  /** Display name, 1–50 chars; unique within the parent, case-insensitive. */
  name: string
  /** Must equal the parent SuperCategory's `type`. */
  type: CategoryType
}
