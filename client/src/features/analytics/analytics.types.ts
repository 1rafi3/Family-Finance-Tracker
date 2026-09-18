export interface BeneficiaryShare {
  id: string
  name: string
  relationship: string
  amount: number
  percentage: number
  color: string
  count: number
  isMyself: boolean
}

export interface MonthlyComparisonDataPoint {
  monthKey: string
  label: string
  fullLabel: string
  income: number
  expense: number
  personalExpense: number
  familyExpense: number
  net: number
  momExpenseChangePct: number | null
}

export interface CategoryHeatmapMonth {
  monthKey: string
  label: string
  amount: number
  count: number
  intensity: number // 0 (none), 1 (low), 2 (medium), 3 (high), 4 (peak)
}

export interface CategoryHeatmapRow {
  categoryId: string
  categoryName: string
  color: string
  months: CategoryHeatmapMonth[]
  totalAmount: number
  peakMonth: string
  peakAmount: number
}

export interface AnalyticsExecutiveKPIs {
  totalExpense: number
  personalExpense: number
  familyExpense: number
  personalRatio: number
  familyRatio: number
  topBeneficiary: {
    id: string
    name: string
    relationship: string
    amount: number
    percentage: number
  } | null
  avgMonthlyBurn: number
  peakMonth: {
    label: string
    amount: number
  } | null
  currency: string
}

export type AnalyticsPeriodPreset = '3_MONTHS' | '6_MONTHS' | '12_MONTHS' | 'ALL_TIME'
