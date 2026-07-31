import { z } from 'zod'
import { WidgetSize } from '../enums/index.js'
import type { DashboardLayout, DashboardWidgetDefinition, WidgetPlacement } from '../types/index.js'
import {
  dateSchema,
  idSchema,
  nonNegativeIntSchema,
  notesSchema,
  widgetKeySchema,
  widgetTitleSchema,
} from '../validators/index.js'

/** Validates a single {@link WidgetPlacement} within a layout. */
export const widgetPlacementSchema: z.ZodType<WidgetPlacement> = z.object({
  widgetKey: widgetKeySchema,
  enabled: z.boolean(),
  order: nonNegativeIntSchema,
  size: z.nativeEnum(WidgetSize),
})

/** Validates a full replacement of the dashboard layout (ADMIN PUT). */
export const dashboardLayoutUpdateSchema = z
  .object({
    widgets: z.array(widgetPlacementSchema),
  })
  .strict()

/** Input type of {@link dashboardLayoutUpdateSchema}. */
export type DashboardLayoutUpdateInput = z.input<typeof dashboardLayoutUpdateSchema>

/** Validates a `DashboardLayout` resource (household singleton). */
export const dashboardLayoutSchema: z.ZodType<DashboardLayout> = z.object({
  id: idSchema,
  widgets: z.array(widgetPlacementSchema),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  updatedBy: idSchema,
})

/** Validates a `DashboardWidgetDefinition` resource (system catalog, read-only). */
export const widgetDefinitionSchema: z.ZodType<DashboardWidgetDefinition> = z.object({
  id: idSchema,
  key: widgetKeySchema,
  title: widgetTitleSchema,
  description: notesSchema.optional(),
  defaultSize: z.nativeEnum(WidgetSize),
  allowedSizes: z.array(z.nativeEnum(WidgetSize)).optional(),
  isSystem: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
