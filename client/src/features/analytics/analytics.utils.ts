import type { SubCategory, SuperCategory, Transaction } from '@family-finance/shared'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import type { PersonWithStats } from '@/features/people/people.api'
import type {
  AnalyticsExecutiveKPIs,
  BeneficiaryShare,
  CategoryHeatmapMonth,
  CategoryHeatmapRow,
  MonthlyComparisonDataPoint,
} from './analytics.types'

export const BENEFICIARY_PALETTE = [
  '#6366f1', // Indigo (Myself / Primary)
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#e11d48', // Rose
]

export const CATEGORY_HEATMAP_PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
]

/**
 * Calculates spending distribution across beneficiaries (Myself vs Family/Dependents).
 * Supports grouping either by specific Person profile or by Relationship (Child, Spouse, etc.)
 */
export function calculateBeneficiaryDistribution(
  transactions: Transaction[],
  people: PersonWithStats[],
  options: { mode?: 'person' | 'relationship'; dateFrom?: string; dateTo?: string } = {},
): BeneficiaryShare[] {
  const { mode = 'person', dateFrom, dateTo } = options

  // Filter completed expense transactions within date window if provided
  const expenseTxs = transactions.filter((tx) => {
    if (tx.type !== TransactionType.EXPENSE || tx.status !== TransactionStatus.COMPLETED) {
      return false
    }
    if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(tx.date) > new Date(dateTo)) return false
    return true
  })

  const totalExpense = expenseTxs.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)

  // Map person lookup
  const personMap = new Map<string, PersonWithStats>()
  people.forEach((p) => personMap.set(p.id, p))

  if (mode === 'relationship') {
    // Group by Relationship
    const relationshipTotals: Record<
      string,
      { amount: number; count: number; relationship: string }
    > = {
      Self: { amount: 0, count: 0, relationship: 'Self' },
    }

    expenseTxs.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0
      if (!tx.personId) {
        relationshipTotals.Self.amount += amount
        relationshipTotals.Self.count += 1
      } else {
        const person = personMap.get(tx.personId)
        const rel = person?.relationship ? capitalize(person.relationship) : 'Dependent'
        if (!relationshipTotals[rel]) {
          relationshipTotals[rel] = { amount: 0, count: 0, relationship: rel }
        }
        relationshipTotals[rel].amount += amount
        relationshipTotals[rel].count += 1
      }
    })

    return Object.entries(relationshipTotals)
      .filter(([, data]) => data.count > 0 || totalExpense === 0)
      .map(([rel, data], index) => {
        const isMyself = rel === 'Self'
        const percentage =
          totalExpense > 0 ? Number(((data.amount / totalExpense) * 100).toFixed(1)) : 0
        return {
          id: rel.toLowerCase(),
          name: isMyself ? 'Myself (Personal)' : rel,
          relationship: rel,
          amount: data.amount,
          percentage,
          color: isMyself
            ? BENEFICIARY_PALETTE[0]
            : BENEFICIARY_PALETTE[(index + 1) % BENEFICIARY_PALETTE.length],
          count: data.count,
          isMyself,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }

  // Default: Group by individual Person profile
  let myselfAmount = 0
  let myselfCount = 0
  const personSpendMap: Record<string, { amount: number; count: number }> = {}

  expenseTxs.forEach((tx) => {
    const amount = parseFloat(tx.amount) || 0
    if (!tx.personId) {
      myselfAmount += amount
      myselfCount += 1
    } else {
      if (!personSpendMap[tx.personId]) {
        personSpendMap[tx.personId] = { amount: 0, count: 0 }
      }
      personSpendMap[tx.personId].amount += amount
      personSpendMap[tx.personId].count += 1
    }
  })

  const results: BeneficiaryShare[] = []

  // Always include Myself
  results.push({
    id: 'myself',
    name: 'Myself (Personal)',
    relationship: 'Self',
    amount: myselfAmount,
    percentage:
      totalExpense > 0 ? Number(((myselfAmount / totalExpense) * 100).toFixed(1)) : 0,
    color: BENEFICIARY_PALETTE[0],
    count: myselfCount,
    isMyself: true,
  })

  // Add all people with recorded transactions or active profiles
  let colorIdx = 1
  Object.entries(personSpendMap).forEach(([personId, stats]) => {
    const person = personMap.get(personId)
    const name = person?.name ?? 'Unknown Dependent'
    const relationship = person?.relationship ? capitalize(person.relationship) : 'Dependent'
    const color =
      person?.color || BENEFICIARY_PALETTE[colorIdx % BENEFICIARY_PALETTE.length]
    colorIdx++

    results.push({
      id: personId,
      name,
      relationship,
      amount: stats.amount,
      percentage:
        totalExpense > 0 ? Number(((stats.amount / totalExpense) * 100).toFixed(1)) : 0,
      color,
      count: stats.count,
      isMyself: false,
    })
  })

  // Sort by highest amount descending
  return results.sort((a, b) => b.amount - a.amount)
}

/**
 * Calculates multi-month cash flow and personal vs family spending comparison.
 */
export function calculateMonthlySpendingComparison(
  transactions: Transaction[],
  monthCount = 6,
): MonthlyComparisonDataPoint[] {
  const now = new Date()
  const monthBuckets: {
    key: string
    label: string
    fullLabel: string
    d: Date
  }[] = []

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString(undefined, { month: 'short' })
    const fullLabel = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    monthBuckets.push({ key, label, fullLabel, d })
  }

  const monthlyData: Record<
    string,
    {
      income: number
      expense: number
      personalExpense: number
      familyExpense: number
    }
  > = {}

  monthBuckets.forEach((b) => {
    monthlyData[b.key] = {
      income: 0,
      expense: 0,
      personalExpense: 0,
      familyExpense: 0,
    }
  })

  transactions.forEach((tx) => {
    if (tx.status !== TransactionStatus.COMPLETED) return

    const d = new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[key]) return

    const amount = parseFloat(tx.amount) || 0
    if (tx.type === TransactionType.INCOME) {
      monthlyData[key].income += amount
    } else if (tx.type === TransactionType.EXPENSE) {
      monthlyData[key].expense += amount
      if (tx.personId) {
        monthlyData[key].familyExpense += amount
      } else {
        monthlyData[key].personalExpense += amount
      }
    }
  })

  let prevExpense: number | null = null

  return monthBuckets.map(({ key, label, fullLabel }) => {
    const data = monthlyData[key]
    let momExpenseChangePct: number | null = null

    if (prevExpense !== null && prevExpense > 0) {
      momExpenseChangePct = Number(
        (((data.expense - prevExpense) / prevExpense) * 100).toFixed(1),
      )
    } else if (prevExpense === 0 && data.expense > 0) {
      momExpenseChangePct = 100
    }

    prevExpense = data.expense

    return {
      monthKey: key,
      label,
      fullLabel,
      income: data.income,
      expense: data.expense,
      personalExpense: data.personalExpense,
      familyExpense: data.familyExpense,
      net: data.income - data.expense,
      momExpenseChangePct,
    }
  })
}

/**
 * Calculates a dynamic Category Heatmap matrix across the last N months.
 */
export function calculateCategoryHeatmap(
  transactions: Transaction[],
  subCategories: SubCategory[],
  superCategories: SuperCategory[],
  monthsBack = 6,
): { rows: CategoryHeatmapRow[]; monthColumns: { key: string; label: string }[] } {
  const now = new Date()
  const monthColumns: { key: string; label: string }[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString(undefined, { month: 'short' })
    monthColumns.push({ key, label })
  }

  // Create SubCategory -> SuperCategory lookup
  const subCategoryMap = new Map<string, SubCategory>()
  subCategories.forEach((sc) => subCategoryMap.set(sc.id, sc))

  const superCategoryMap = new Map<string, SuperCategory>()
  superCategories.forEach((sc) => superCategoryMap.set(sc.id, sc))

  // Aggregate by Category ID (roll up to SuperCategory if available, otherwise subcategory)
  const categoryMatrix: Record<
    string,
    {
      name: string
      color: string
      months: Record<string, { amount: number; count: number }>
      totalAmount: number
    }
  > = {}

  // Filter completed expense transactions
  const expenseTxs = transactions.filter(
    (tx) => tx.type === TransactionType.EXPENSE && tx.status === TransactionStatus.COMPLETED,
  )

  expenseTxs.forEach((tx) => {
    const d = new Date(tx.date)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    // Check if month is in our column range
    if (!monthColumns.some((col) => col.key === monthKey)) return

    const amount = parseFloat(tx.amount) || 0

    // Resolve category name and key
    let catId = 'general'
    let catName = 'General & Miscellaneous'
    let catColor = '#64748b'

    if (tx.subCategoryId) {
      const sub = subCategoryMap.get(tx.subCategoryId)
      if (sub) {
        if (sub.superCategoryId) {
          const parent = superCategoryMap.get(sub.superCategoryId)
          if (parent) {
            catId = parent.id
            catName = parent.name
            catColor = parent.color || '#3b82f6'
          } else {
            catId = sub.id
            catName = sub.name
            catColor = sub.color || '#3b82f6'
          }
        } else {
          catId = sub.id
          catName = sub.name
          catColor = sub.color || '#3b82f6'
        }
      }
    }

    if (!categoryMatrix[catId]) {
      categoryMatrix[catId] = {
        name: catName,
        color: catColor,
        months: {},
        totalAmount: 0,
      }
      monthColumns.forEach((col) => {
        categoryMatrix[catId].months[col.key] = { amount: 0, count: 0 }
      })
    }

    categoryMatrix[catId].months[monthKey].amount += amount
    categoryMatrix[catId].months[monthKey].count += 1
    categoryMatrix[catId].totalAmount += amount
  })

  // Find max cell amount across all categories & months to normalize heat levels
  let maxCellAmount = 0
  Object.values(categoryMatrix).forEach((cat) => {
    Object.values(cat.months).forEach((cell) => {
      if (cell.amount > maxCellAmount) maxCellAmount = cell.amount
    })
  })

  // If no transactions exist, populate default rows with 0s for visual clarity
  if (Object.keys(categoryMatrix).length === 0 && superCategories.length > 0) {
    superCategories.slice(0, 4).forEach((sc) => {
      categoryMatrix[sc.id] = {
        name: sc.name,
        color: sc.color || '#3b82f6',
        months: {},
        totalAmount: 0,
      }
      monthColumns.forEach((col) => {
        categoryMatrix[sc.id].months[col.key] = { amount: 0, count: 0 }
      })
    })
  }

  const rows: CategoryHeatmapRow[] = Object.entries(categoryMatrix).map(
    ([catId, data], index) => {
      let peakMonth = '-'
      let peakAmount = 0

      const months: CategoryHeatmapMonth[] = monthColumns.map((col) => {
        const cell = data.months[col.key] ?? { amount: 0, count: 0 }
        if (cell.amount > peakAmount) {
          peakAmount = cell.amount
          peakMonth = col.label
        }

        // Intensity calculation (0 to 4)
        let intensity = 0
        if (cell.amount > 0) {
          if (maxCellAmount === 0 || cell.amount <= maxCellAmount * 0.25) {
            intensity = 1
          } else if (cell.amount <= maxCellAmount * 0.5) {
            intensity = 2
          } else if (cell.amount <= maxCellAmount * 0.75) {
            intensity = 3
          } else {
            intensity = 4
          }
        }

        return {
          monthKey: col.key,
          label: col.label,
          amount: cell.amount,
          count: cell.count,
          intensity,
        }
      })

      return {
        categoryId: catId,
        categoryName: data.name,
        color: data.color || CATEGORY_HEATMAP_PALETTE[index % CATEGORY_HEATMAP_PALETTE.length],
        months,
        totalAmount: data.totalAmount,
        peakMonth: peakAmount > 0 ? peakMonth : 'N/A',
        peakAmount,
      }
    },
  )

  // Sort rows by total amount descending
  rows.sort((a, b) => b.totalAmount - a.totalAmount)

  return { rows, monthColumns }
}

/**
 * Derives Executive Analytics KPIs (personal vs family ratio, top beneficiary, burn rate, peak month)
 */
export function calculateAnalyticsExecutiveKPIs(
  transactions: Transaction[],
  people: PersonWithStats[],
  currency = 'BDT',
  monthsCount = 6,
): AnalyticsExecutiveKPIs {
  const expenseTxs = transactions.filter(
    (tx) => tx.type === TransactionType.EXPENSE && tx.status === TransactionStatus.COMPLETED,
  )

  let personalExpense = 0
  let familyExpense = 0
  const monthlySums: Record<string, number> = {}

  expenseTxs.forEach((tx) => {
    const amount = parseFloat(tx.amount) || 0
    if (tx.personId) {
      familyExpense += amount
    } else {
      personalExpense += amount
    }

    const d = new Date(tx.date)
    const monthKey = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    monthlySums[monthKey] = (monthlySums[monthKey] ?? 0) + amount
  })

  const totalExpense = personalExpense + familyExpense
  const personalRatio =
    totalExpense > 0 ? Math.round((personalExpense / totalExpense) * 100) : 100
  const familyRatio = 100 - personalRatio

  // Top beneficiary
  const beneficiaryShares = calculateBeneficiaryDistribution(transactions, people, {
    mode: 'person',
  })
  const topNonSelf = beneficiaryShares.find((b) => !b.isMyself && b.amount > 0)

  // Peak month
  let peakMonth: { label: string; amount: number } | null = null
  Object.entries(monthlySums).forEach(([label, amount]) => {
    if (!peakMonth || amount > peakMonth.amount) {
      peakMonth = { label, amount }
    }
  })

  const avgMonthlyBurn = monthsCount > 0 ? totalExpense / Math.max(1, monthsCount) : 0

  return {
    totalExpense,
    personalExpense,
    familyExpense,
    personalRatio,
    familyRatio,
    topBeneficiary: topNonSelf
      ? {
          id: topNonSelf.id,
          name: topNonSelf.name,
          relationship: topNonSelf.relationship,
          amount: topNonSelf.amount,
          percentage: topNonSelf.percentage,
        }
      : null,
    avgMonthlyBurn,
    peakMonth,
    currency,
  }
}

function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
