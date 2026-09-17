import type { Transaction, Wallet } from '@family-finance/shared'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import { getSubCategoryName } from '../transactions/transaction.constants'

export interface DashboardMetrics {
  totalBalance: number
  currency: string
  monthlyIncome: number
  monthlyExpense: number
  netCashFlow: number
  savingsRate: number
}

export interface CashFlowDataPoint {
  name: string
  income: number
  expense: number
  net: number
}

export interface CategoryExpenseDataPoint {
  id: string
  name: string
  amount: number
  percentage: number
  color: string
}

export interface WalletDistributionDataPoint {
  id: string
  name: string
  balance: number
  percentage: number
  color: string
}

export interface QuickInsight {
  id: string
  title: string
  value: string
  description: string
  type: 'category' | 'expense' | 'wallet' | 'savings'
}

const CATEGORY_COLORS = [
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

const WALLET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export function calculateDashboardMetrics(
  wallets: Wallet[],
  transactions: Transaction[],
): DashboardMetrics {
  const activeWallets = wallets.filter((w) => !w.isArchived)
  const dominantCurrency = activeWallets[0]?.currency ?? 'BDT'

  const totalBalance = activeWallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let monthlyIncome = 0
  let monthlyExpense = 0

  transactions.forEach((tx) => {
    if (tx.status !== TransactionStatus.COMPLETED) return

    const txDate = new Date(tx.date)
    if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      const amount = parseFloat(tx.amount) || 0
      if (tx.type === TransactionType.INCOME) {
        monthlyIncome += amount
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyExpense += amount
      }
    }
  })

  const netCashFlow = monthlyIncome - monthlyExpense
  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)) : 0

  return {
    totalBalance,
    currency: dominantCurrency,
    monthlyIncome,
    monthlyExpense,
    netCashFlow,
    savingsRate,
  }
}

export function calculateCashFlowTrend(transactions: Transaction[]): CashFlowDataPoint[] {
  const monthlyMap: Record<string, { income: number; expense: number }> = {}

  // Last 6 months labels
  const monthLabels: { key: string; label: string }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString(undefined, { month: 'short' })
    monthLabels.push({ key, label })
    monthlyMap[key] = { income: 0, expense: 0 }
  }

  transactions.forEach((tx) => {
    if (tx.status !== TransactionStatus.COMPLETED) return
    const d = new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    if (monthlyMap[key]) {
      const amount = parseFloat(tx.amount) || 0
      if (tx.type === TransactionType.INCOME) {
        monthlyMap[key].income += amount
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyMap[key].expense += amount
      }
    }
  })

  return monthLabels.map(({ key, label }) => {
    const income = monthlyMap[key]?.income ?? 0
    const expense = monthlyMap[key]?.expense ?? 0
    return {
      name: label,
      income,
      expense,
      net: income - expense,
    }
  })
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryExpenseDataPoint[] {
  const categoryTotals: Record<string, number> = {}
  let totalExpense = 0

  transactions.forEach((tx) => {
    if (tx.type === TransactionType.EXPENSE && tx.status === TransactionStatus.COMPLETED) {
      const amount = parseFloat(tx.amount) || 0
      const catId = tx.subCategoryId ?? 'general'
      categoryTotals[catId] = (categoryTotals[catId] ?? 0) + amount
      totalExpense += amount
    }
  })

  const sortedCategories = Object.entries(categoryTotals)
    .map(([id, amount], index) => ({
      id,
      name: getSubCategoryName(id),
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)

  return sortedCategories
}

export function calculateWalletDistribution(wallets: Wallet[]): WalletDistributionDataPoint[] {
  const activeWallets = wallets.filter((w) => !w.isArchived)
  const totalBalance = activeWallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0)

  return activeWallets.map((w, index) => {
    const balance = parseFloat(w.balance) || 0
    return {
      id: w.id,
      name: w.name,
      balance,
      percentage: totalBalance > 0 ? Math.round((balance / totalBalance) * 100) : 0,
      color: WALLET_COLORS[index % WALLET_COLORS.length],
    }
  })
}

export function generateQuickInsights(
  wallets: Wallet[],
  transactions: Transaction[],
): QuickInsight[] {
  const insights: QuickInsight[] = []

  const completedTxs = transactions.filter((t) => t.status === TransactionStatus.COMPLETED)

  // 1. Highest Spending Category
  const categories = calculateCategoryBreakdown(transactions)
  if (categories.length > 0) {
    const topCat = categories[0]
    insights.push({
      id: 'top-category',
      title: 'Top Expense Category',
      value: topCat.name,
      description: `${topCat.percentage}% of total expenses (${topCat.amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`,
      type: 'category',
    })
  }

  // 2. Largest Expense This Month
  const now = new Date()
  const thisMonthExpenses = completedTxs.filter((t) => {
    const d = new Date(t.date)
    return (
      t.type === TransactionType.EXPENSE &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })

  if (thisMonthExpenses.length > 0) {
    const largest = [...thisMonthExpenses].sort(
      (a, b) => parseFloat(b.amount) - parseFloat(a.amount),
    )[0]
    insights.push({
      id: 'largest-expense',
      title: 'Largest Expense This Month',
      value: `${largest.currency} ${parseFloat(largest.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: `${getSubCategoryName(largest.subCategoryId)} — ${new Date(
        largest.date,
      ).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      type: 'expense',
    })
  }

  // 3. Most Used Wallet
  const walletCounts: Record<string, number> = {}
  transactions.forEach((tx) => {
    const wId = tx.walletId ?? tx.sourceWalletId
    if (wId) {
      walletCounts[wId] = (walletCounts[wId] ?? 0) + 1
    }
  })

  const topWalletId = Object.entries(walletCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (topWalletId) {
    const wallet = wallets.find((w) => w.id === topWalletId)
    if (wallet) {
      insights.push({
        id: 'most-used-wallet',
        title: 'Most Active Account',
        value: wallet.name,
        description: `${walletCounts[topWalletId]} transactions recorded in this account`,
        type: 'wallet',
      })
    }
  }

  // 4. Monthly Savings Rate
  const metrics = calculateDashboardMetrics(wallets, transactions)
  if (metrics.monthlyIncome > 0) {
    insights.push({
      id: 'savings-rate',
      title: 'Monthly Savings Rate',
      value: `${metrics.savingsRate}%`,
      description:
        metrics.savingsRate > 20
          ? 'Healthy savings rate for the current calendar month'
          : 'Consider reviewing high spending categories this month',
      type: 'savings',
    })
  }

  return insights
}
