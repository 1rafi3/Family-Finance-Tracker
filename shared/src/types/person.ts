import { PERSON_RELATIONSHIPS } from '../constants/index.js'
import type { ArchivableEntity } from './base.js'
import type { Id } from './common.js'

export type PersonRelationship = (typeof PERSON_RELATIONSHIPS)[number] | string

/**
 * A Person or Dependent profile for whom expenses can be tracked.
 * Used for "Spent For" beneficiary tracking in FinFlow without requiring separate user logins.
 */
export interface Person extends ArchivableEntity {
  /** The owning user who manages this profile. */
  ownerId: Id
  /** Display name of the person/dependent (e.g. "Aarav", "Father"). */
  name: string
  /** Relationship to the user (e.g. "Child", "Parent", "Pet"). */
  relationship: PersonRelationship
  /** Visual color accent hex code (e.g. "#3b82f6"). */
  color?: string
  /** Visual avatar identifier or emoji. */
  avatar?: string
  /** Optional notes or details. */
  notes?: string
}
