import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  PieChart,
  Printer,
  Receipt,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { useCategories } from '@/features/categories/useCategories'
import { usePeople } from '@/features/people/usePeople'
import { getSubCategoryName } from '@/features/transactions/transaction.constants'
import { fetchTransactions } from '@/features/transactions/transaction.service'
import { useWallets } from '@/features/wallets/useWallets'
import { TransactionType } from '@family-finance/shared'

type PeriodPreset = 'THIS_MONTH' | 'LAST_MONTH' | 'TODAY' | 'LAST_30_DAYS' | 'THIS_YEAR' | 'CUSTOM'

export function ReportsPage() {
  const { user } = useAuth()
  const { people } = usePeople()
  const { data: wallets = [] } = useWallets()
  const { subCategories } = useCategories()

  // State
  const [period, setPeriod] = useState<PeriodPreset>('THIS_MONTH')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')

  // Compute active date range based on preset
  const { dateFrom, dateTo, periodLabel } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()

    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    switch (period) {
      case 'TODAY': {
        const todayStr = fmt(now)
        return { dateFrom: todayStr, dateTo: todayStr, periodLabel: `Today (${now.toLocaleDateString(undefined, { dateStyle: 'medium' })})` }
      }
      case 'THIS_MONTH': {
        const start = new Date(y, m, 1)
        const end = new Date(y, m + 1, 0)
        return {
          dateFrom: fmt(start),
          dateTo: fmt(end),
          periodLabel: now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        }
      }
      case 'LAST_MONTH': {
        const start = new Date(y, m - 1, 1)
        const end = new Date(y, m, 0)
        return {
          dateFrom: fmt(start),
          dateTo: fmt(end),
          periodLabel: start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        }
      }
      case 'LAST_30_DAYS': {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          dateFrom: fmt(start),
          dateTo: fmt(now),
          periodLabel: `Last 30 Days (${fmt(start)} to ${fmt(now)})`,
        }
      }
      case 'THIS_YEAR': {
        const start = new Date(y, 0, 1)
        const end = new Date(y, 11, 31)
        return {
          dateFrom: fmt(start),
          dateTo: fmt(end),
          periodLabel: `Full Year ${y}`,
        }
      }
      case 'CUSTOM':
      default: {
        const label = customFrom && customTo ? `${customFrom} to ${customTo}` : 'Custom Range'
        return { dateFrom: customFrom || undefined, dateTo: customTo || undefined, periodLabel: label }
      }
    }
  }, [period, customFrom, customTo])

  // Fetch transactions with applied filters
  const { data: txResult, isLoading, isFetching } = useQuery({
    queryKey: [
      'report-transactions',
      {
        dateFrom,
        dateTo,
        personId: selectedPersonId === 'MYSELF' ? undefined : selectedPersonId || undefined,
        walletId: selectedWalletId || undefined,
        type: selectedType || undefined,
      },
    ],
    queryFn: () =>
      fetchTransactions({
        dateFrom,
        dateTo,
        personId: selectedPersonId === 'MYSELF' ? undefined : selectedPersonId || undefined,
        walletId: selectedWalletId || undefined,
        type: selectedType || undefined,
        limit: 200,
      }),
  })

  // Filter for 'MYSELF' client-side if selected
  const transactions = useMemo(() => {
    let list = txResult?.data ?? []
    if (selectedPersonId === 'MYSELF') {
      list = list.filter((t) => !t.personId)
    }
    // Sort chronological descending
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [txResult, selectedPersonId])

  // Aggregate Metrics & Category Breakdown
  const { totalIncome, totalExpense, netCashFlow, categoryBreakdown } = useMemo(() => {
    let incomeSum = 0
    let expenseSum = 0
    const catMap: Record<string, { name: string; count: number; total: number }> = {}

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0
      if (tx.type === TransactionType.INCOME) {
        incomeSum += amt
      } else if (tx.type === TransactionType.EXPENSE) {
        expenseSum += amt

        const subCat = subCategories.find((c) => c.id === tx.subCategoryId)
        const catName = subCat?.name || getSubCategoryName(tx.subCategoryId) || 'General'
        if (!catMap[catName]) {
          catMap[catName] = { name: catName, count: 0, total: 0 }
        }
        catMap[catName].count += 1
        catMap[catName].total += amt
      }
    })

    const catArray = Object.values(catMap)
      .map((c) => ({
        ...c,
        percentage: expenseSum > 0 ? Math.round((c.total / expenseSum) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return {
      totalIncome: incomeSum,
      totalExpense: expenseSum,
      netCashFlow: incomeSum - expenseSum,
      categoryBreakdown: catArray,
    }
  }, [transactions, subCategories])

  // Helper names
  const selectedPersonName = useMemo(() => {
    if (!selectedPersonId) return 'All Beneficiaries'
    if (selectedPersonId === 'MYSELF') return 'Myself Only (Personal)'
    const p = people.find((x) => x.id === selectedPersonId)
    return p ? `${p.name} (${p.relationship})` : 'Selected Person'
  }, [selectedPersonId, people])

  const selectedWalletName = useMemo(() => {
    if (!selectedWalletId) return 'All Accounts'
    const w = wallets.find((x) => x.id === selectedWalletId)
    return w ? `${w.name} (${w.currency})` : 'Selected Account'
  }, [selectedWalletId, wallets])

  const getAccountName = (walletId?: string) => {
    if (!walletId) return 'Account'
    const w = wallets.find((x) => x.id === walletId)
    return w ? w.name : 'Account'
  }

  const getPersonName = (personId?: string) => {
    if (!personId) return 'Myself'
    const p = people.find((x) => x.id === personId)
    return p ? `${p.name} (${p.relationship})` : 'Person'
  }

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Handle CSV Export
  const handleExportCSV = () => {
    if (!transactions.length) return

    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Category',
      'Notes / Description',
      'Account',
      'Beneficiary (Spent For)',
      'Amount',
      'Currency',
    ]

    const rows = transactions.map((tx) => {
      const subCat = subCategories.find((c) => c.id === tx.subCategoryId)
      const catName = subCat?.name || getSubCategoryName(tx.subCategoryId) || ''
      const beneficiary = tx.personId ? getPersonName(tx.personId) : 'Myself'
      const acc = getAccountName(tx.walletId)

      return [
        `"${tx.id}"`,
        `"${new Date(tx.date).toLocaleDateString()}"`,
        `"${tx.type}"`,
        `"${catName}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
        `"${acc}"`,
        `"${beneficiary}"`,
        `"${tx.type === TransactionType.EXPENSE ? `-${tx.amount}` : tx.amount}"`,
        `"${tx.currency}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `FinFlow-Statement-${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const statementRef = useMemo(() => {
    return `FF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`
  }, [])

  return (
    <div className="space-y-6 pb-12">
      {/* Screen-Only Control Toolbar */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <span>Statements & Receipt Reports</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate, filter, print, and export official financial statements for yourself or dependents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className="gap-1.5 shadow-sm text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              disabled={transactions.length === 0}
              className="gap-1.5 shadow-sm text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Filter Configuration Panel */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>Statement Parameters</span>
            </div>
            {isFetching && (
              <span className="text-[11px] text-primary animate-pulse flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Updating statement...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Period Preset */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Timeframe
              </label>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
                className="h-9 text-xs"
              >
                <option value="THIS_MONTH">This Month (Current)</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="TODAY">Today (Daily Receipt)</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_YEAR">Full Year (YTD)</option>
                <option value="CUSTOM">Custom Date Range...</option>
              </Select>
            </div>

            {/* Beneficiary Filter */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Beneficiary (Spent For)
              </label>
              <Select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="">All Transactions (Household)</option>
                <option value="MYSELF">Myself Only (Personal)</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
              </Select>
            </div>

            {/* Account Filter */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Account / Wallet
              </label>
              <Select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="">All Accounts</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.currency})
                  </option>
                ))}
              </Select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Transaction Type
              </label>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="">All Activity (Income & Expense)</option>
                <option value={TransactionType.EXPENSE}>Expenses Only</option>
                <option value={TransactionType.INCOME}>Income Only</option>
              </Select>
            </div>
          </div>

          {/* Custom Date Inputs Row if CUSTOM selected */}
          {period === 'CUSTOM' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
              <Input
                type="date"
                label="Start Date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Printable Statement Document (A4 Canvas) */}
      <div className="print-container bg-card text-foreground border border-border/80 rounded-2xl shadow-xl p-6 sm:p-10 max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Document Header */}
        <div className="border-b-2 border-primary/20 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md print:bg-black print:text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-foreground print:text-black">
                  FinFlow
                </span>
              </div>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Personal Finance & Wealth Management Portal
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary print:bg-gray-100 print:text-black print:border print:border-gray-400">
                Financial Statement
              </div>
              <p className="text-[11px] font-mono text-muted-foreground print:text-gray-600">
                Ref: {statementRef}
              </p>
            </div>
          </div>

          {/* Statement Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground print:text-gray-500 block text-[10px] uppercase font-semibold">
                Account Owner
              </span>
              <span className="font-bold text-foreground print:text-black block mt-0.5">
                {user ? `${user.firstName} ${user.lastName}` : 'Rafi Karim'}
              </span>
              <span className="text-[11px] text-muted-foreground print:text-gray-600 truncate block">
                {user?.email || 'rafi@example.com'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground print:text-gray-500 block text-[10px] uppercase font-semibold">
                Statement Period
              </span>
              <span className="font-semibold text-foreground print:text-black block mt-0.5">
                {periodLabel}
              </span>
              <span className="text-[11px] text-muted-foreground print:text-gray-600 block">
                {dateFrom || 'Start'} → {dateTo || 'Present'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground print:text-gray-500 block text-[10px] uppercase font-semibold">
                Beneficiary Scope
              </span>
              <span className="font-semibold text-foreground print:text-black block mt-0.5">
                {selectedPersonName}
              </span>
              <span className="text-[11px] text-muted-foreground print:text-gray-600 block">
                {selectedWalletName}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground print:text-gray-500 block text-[10px] uppercase font-semibold">
                Generated Timestamp
              </span>
              <span className="font-semibold text-foreground print:text-black block mt-0.5">
                {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
              <span className="text-[11px] text-muted-foreground print:text-gray-600 block">
                {new Date().toLocaleTimeString(undefined, { timeStyle: 'short' })}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Financial Summary Tiles */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Total Inflow */}
          <div className="rounded-xl border border-border bg-card p-4 text-center print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
              Total Inflow (Income)
            </span>
            <div className="text-base sm:text-xl font-bold font-mono text-emerald-600 print:text-black mt-1">
              + BDT {totalIncome.toFixed(2)}
            </div>
          </div>

          {/* Total Outflow */}
          <div className="rounded-xl border border-border bg-card p-4 text-center print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
              Total Outflow (Expenses)
            </span>
            <div className="text-base sm:text-xl font-bold font-mono text-destructive print:text-black mt-1">
              - BDT {totalExpense.toFixed(2)}
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="rounded-xl border border-border bg-card p-4 text-center print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
              Net Cash Flow
            </span>
            <div
              className={`text-base sm:text-xl font-bold font-mono mt-1 ${
                netCashFlow >= 0 ? 'text-primary print:text-black' : 'text-destructive print:text-black'
              }`}
            >
              {netCashFlow >= 0 ? '+' : ''} BDT {netCashFlow.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table (if expenses exist) */}
        {categoryBreakdown.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-primary print:text-black" />
              <span>Category Allocation Summary</span>
            </h3>

            <div className="rounded-lg border border-border/80 overflow-hidden print:border-gray-400 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 print:bg-gray-100 border-b border-border/80 print:border-gray-400">
                  <tr>
                    <th className="py-2 px-3 font-semibold text-foreground print:text-black">Category</th>
                    <th className="py-2 px-3 font-semibold text-center text-foreground print:text-black">
                      Transactions
                    </th>
                    <th className="py-2 px-3 font-semibold text-right text-foreground print:text-black">
                      Total (BDT)
                    </th>
                    <th className="py-2 px-3 font-semibold text-right text-foreground print:text-black">
                      % Allocation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-300">
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.name} className="hover:bg-muted/20 print:hover:bg-transparent">
                      <td className="py-2 px-3 font-medium text-foreground print:text-black">
                        {cat.name}
                      </td>
                      <td className="py-2 px-3 text-center text-muted-foreground print:text-gray-700 font-mono">
                        {cat.count}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-destructive print:text-black">
                        BDT {cat.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-muted-foreground print:text-black">
                        {cat.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Itemized Transaction Ledger */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-black flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-primary print:text-black" />
              <span>Itemized Activity Ledger ({transactions.length} Transactions)</span>
            </h3>
            <span className="text-[11px] text-muted-foreground print:text-gray-500 font-mono">
              Currency: BDT
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-muted/10 print:border-gray-400">
              <Receipt className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground print:text-black">
                No financial transactions recorded for this period & filters.
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-500 mt-1">
                Try expanding your timeframe or clearing the beneficiary filter.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/80 overflow-hidden print:border-gray-400 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 print:bg-gray-100 border-b border-border/80 print:border-gray-400">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-foreground print:text-black w-8">#</th>
                    <th className="py-2.5 px-3 font-semibold text-foreground print:text-black">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-foreground print:text-black">
                      Description & Category
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-foreground print:text-black">Account</th>
                    <th className="py-2.5 px-3 font-semibold text-foreground print:text-black">
                      Spent For
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-right text-foreground print:text-black">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-300 font-normal">
                  {transactions.map((tx, index) => {
                    const subCat = subCategories.find((c) => c.id === tx.subCategoryId)
                    const catName = subCat?.name || getSubCategoryName(tx.subCategoryId) || 'General'
                    const isExpense = tx.type === TransactionType.EXPENSE
                    const isIncome = tx.type === TransactionType.INCOME
                    const beneficiary = tx.personId ? getPersonName(tx.personId) : 'Myself'

                    return (
                      <tr key={tx.id} className="hover:bg-muted/10 print:hover:bg-transparent">
                        <td className="py-2 px-3 text-muted-foreground print:text-gray-500 font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap text-foreground print:text-black">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-foreground print:text-black truncate max-w-[200px]">
                            {tx.notes || catName}
                          </div>
                          <div className="text-[10px] text-muted-foreground print:text-gray-600">
                            {catName}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground print:text-gray-700 whitespace-nowrap">
                          {getAccountName(tx.walletId)}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              tx.personId
                                ? 'bg-primary/10 text-primary print:bg-gray-100 print:text-black print:border'
                                : 'text-muted-foreground print:text-gray-600'
                            }`}
                          >
                            {beneficiary}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              isExpense
                                ? 'text-destructive print:text-black'
                                : isIncome
                                ? 'text-emerald-600 print:text-black'
                                : 'text-foreground print:text-black'
                            }
                          >
                            {isExpense ? '-' : isIncome ? '+' : ''} BDT {Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statement Sign-off & Watermark Footer */}
        <div className="pt-6 border-t border-border/80 text-xs text-muted-foreground print:text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary print:text-black shrink-0" />
            <span>Certified computer-generated financial document. Signature not required.</span>
          </div>
          <div className="text-[11px] font-mono text-center sm:text-right">
            FinFlow Personal Wealth Portal • Confidential
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
