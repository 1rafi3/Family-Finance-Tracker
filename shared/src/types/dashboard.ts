import type { WidgetSize } from '../enums/index.js'
import type { AuditFields, BaseEntity } from './base.js'
import type { Id } from './common.js'

/**
 * Placement of one dashboard widget within a layout: which widget, whether it
 * is enabled, its order, and its rendered size (domain model §3.11).
 */
export interface WidgetPlacement {
  /** Must reference a {@link DashboardWidgetDefinition}.`key`. */
  widgetKey: string
  /** `false` suppresses rendering but keeps the placement. */
  enabled: boolean
  /** Sort position; ≥ 0 and unique within the layout. */
  order: number
  /** Rendered size; must be within the definition's `allowedSizes`. */
  size: WidgetSize
}

/**
 * Seed shape for a dashboard widget definition (catalog entry without an id,
 * used to seed the system catalog).
 */
export interface WidgetDefinitionSeed {
  /** Unique, immutable machine key. */
  key: string
  /** Display title. */
  title: string
  /** Optional help text. */
  description?: string
  /** Size applied unless overridden in a layout placement. */
  defaultSize: WidgetSize
  /** Sizes permitted for this widget; absent means all sizes allowed. */
  allowedSizes?: WidgetSize[]
}

/**
 * Catalog of available dashboard widget types. System-managed and read-only in
 * V1 (domain model §3.10).
 */
export interface DashboardWidgetDefinition extends BaseEntity, AuditFields {
  /** Unique, immutable machine key, e.g. `current-balance`. */
  key: string
  /** Display title. */
  title: string
  /** Optional help text. */
  description?: string
  /** Size applied unless overridden in a layout placement. */
  defaultSize: WidgetSize
  /** Sizes permitted for this widget; absent means all sizes allowed. */
  allowedSizes?: WidgetSize[]
  /** `true` for system-defined catalog entries. */
  isSystem: boolean
}

/**
 * The household-level singleton describing which widgets are enabled, their
 * order, and their size. Only ADMINs modify it (domain model §3.11).
 */
export interface DashboardLayout extends BaseEntity {
  /** Embedded widget placements. */
  widgets: WidgetPlacement[]
  /** The ADMIN who customized the layout. */
  updatedBy: Id
}
