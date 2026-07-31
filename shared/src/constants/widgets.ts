import { WidgetSize } from '../enums/index.js'
import type { WidgetPlacement } from '../types/index.js'
import type { WidgetDefinitionSeed } from '../types/dashboard.js'

/** Default size applied to a widget when its definition specifies none. */
export const DEFAULT_WIDGET_SIZE = WidgetSize.MEDIUM

/** Machine keys of the V1 dashboard widget catalog. */
export const WIDGET_DEFINITION_KEYS = [
  'current-balance',
  'income',
  'expense',
  'savings-progress',
] as const

/**
 * System-seeded dashboard widget catalog (V1). The catalog is read-only in V1
 * (domain model §3.10); new widget types are added by developers as seed data.
 */
export const DEFAULT_WIDGET_DEFINITIONS: readonly WidgetDefinitionSeed[] = [
  {
    key: 'current-balance',
    title: 'Current Balance',
    description: 'Combined balance across all wallets.',
    defaultSize: WidgetSize.MEDIUM,
    allowedSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
  },
  {
    key: 'income',
    title: 'Income',
    description: 'Household income for the current month.',
    defaultSize: WidgetSize.SMALL,
    allowedSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
  },
  {
    key: 'expense',
    title: 'Expense',
    description: 'Household expense for the current month.',
    defaultSize: WidgetSize.SMALL,
    allowedSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
  },
  {
    key: 'savings-progress',
    title: 'Savings Progress',
    description: 'Progress toward active savings goals.',
    defaultSize: WidgetSize.MEDIUM,
    allowedSizes: [WidgetSize.SMALL, WidgetSize.MEDIUM, WidgetSize.LARGE],
  },
]

/** Default widget placements used to seed the initial household dashboard layout. */
export const DEFAULT_DASHBOARD_WIDGETS: readonly WidgetPlacement[] = [
  { widgetKey: 'current-balance', enabled: true, order: 1, size: WidgetSize.LARGE },
  { widgetKey: 'income', enabled: true, order: 2, size: WidgetSize.SMALL },
  { widgetKey: 'expense', enabled: true, order: 3, size: WidgetSize.SMALL },
  { widgetKey: 'savings-progress', enabled: false, order: 4, size: WidgetSize.MEDIUM },
]
