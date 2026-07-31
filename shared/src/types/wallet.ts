import type { ArchivableEntity } from './base.js'
import type { Id, Money } from './common.js'

/**
 * A balance container owned by one family member (cash, bank, mobile-money
 * wallet, etc.). Wallet `type` is a free-form string by design — new wallet
 * kinds require no schema change (domain model §3.2).
 */
export interface Wallet extends ArchivableEntity {
  /** The owning user. */
  ownerId: Id
  /** Display name, 1–50 chars. */
  name: string
  /**
   * Free-form wallet type. Recommended vocabulary: `cash`, `bank`, `bkash`,
   * `nagad`, `rocket`, `houseCash`. Additional values allowed by design.
   */
  type: string
  /** ISO 4217 currency code. `BDT` for V1. */
  currency: string
  /**
   * Denormalized, server-maintained balance. Negative values are permitted at
   * the schema level; non-negativity is an application-level rule (domain §3.2).
   */
  balance: Money
}
