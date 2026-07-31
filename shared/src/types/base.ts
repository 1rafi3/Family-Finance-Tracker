import type { Id, ISODateString } from './common.js'

/** Creation and last-update timestamps present on every entity. */
export interface Timestamps {
  /** Set on create. */
  createdAt: ISODateString
  /** Updated on every write. */
  updatedAt: ISODateString
}

/** Minimal persisted-entity shape: identity plus timestamps. */
export interface BaseEntity extends Timestamps {
  id: Id
}

/**
 * Acting-user audit references. Optional because system-generated records
 * (seeds) have no acting user (domain model §2.2).
 */
export interface AuditFields {
  /** User who created the record; optional for system-generated records. */
  createdBy?: Id
  /** User who last updated the record; optional for system writes. */
  updatedBy?: Id
}

/** Entity carrying identity, timestamps, and optional audit references. */
export interface AuditedEntity extends BaseEntity, AuditFields {}

/** Archive flag shared by soft-deletable entities (domain model §2.3). */
export interface Archivable {
  /** `true` hides the entity from active lists and new selections. */
  isArchived: boolean
}

/** Entity that supports soft delete via {@link Archivable.isArchived}. */
export interface ArchivableEntity extends AuditedEntity, Archivable {}
