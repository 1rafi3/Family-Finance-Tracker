import type { ArchivableEntity } from './base.js'

/**
 * An optional, family-managed label attached to transactions for search and
 * reporting. Tags form a many-to-many relationship with transactions through
 * `Transaction.tagIds` (domain model §3.9).
 */
export interface Tag extends ArchivableEntity {
  /** Label name, 1–30 chars; unique case-insensitively, trimmed. */
  name: string
  /** Denormalized count of linked transactions; server-maintained. */
  usageCount: number
}
