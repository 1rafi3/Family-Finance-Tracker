import type { UserRole } from '../enums/index.js'
import type { AuditFields, BaseEntity } from './base.js'
import type { ISODateString } from './common.js'

/**
 * A member account in the household. Public API shape — the server-side
 * `passwordHash` is intentionally not exposed (API contract §8.1).
 */
export interface User extends BaseEntity, AuditFields {
  /** First name, 1–50 chars. */
  firstName: string
  /** Last name, 1–50 chars. */
  lastName: string
  /** Login email; stored lowercase, unique case-insensitively. */
  email: string
  /** Role within the household. */
  role: UserRole
  /** `false` disables login but preserves all historical records. */
  isActive: boolean
  /** Timestamp of the last successful login, if any. */
  lastLoginAt?: ISODateString
}
