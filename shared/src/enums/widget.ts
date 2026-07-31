/**
 * Size class of a dashboard widget.
 * - `SMALL`: compact tile.
 * - `MEDIUM`: standard tile.
 * - `LARGE`: full-width tile.
 */
export const WidgetSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
} as const

/** Union type of all {@link WidgetSize} values. */
export type WidgetSize = (typeof WidgetSize)[keyof typeof WidgetSize]
