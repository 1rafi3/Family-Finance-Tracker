import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Edit2,
  ExternalLink,
  PieChart,
  Receipt,
  TrendingDown,
  User,
  Wallet as WalletIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/features/categories/useCategories'
import { getSubCategoryName } from '@/features/transactions/transaction.constants'
import { fetchTransactions } from '@/features/transactions/transaction.service'
import { useWallets } from '@/features/wallets/useWallets'
import type { PersonWithStats } from '../people.api'

export interface PersonDetailDrawerProps {
  person: PersonWithStats | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (person: PersonWithStats) => void
  currency?: string
}

export function PersonDetailDrawer({
  person,
  isOpen,
  onClose,
  onEdit,
  currency = 'BDT',
}: PersonDetailDrawerProps) {
  const navigate = useNavigate()
  const { data: wallets = [] } = useWallets()
  const { subCategories } = useCategories()

  // Fetch transactions specifically for this person
  const { data: txData, isLoading } = useQuery({
    queryKey: ['transactions', { personId: person?.id }],
    queryFn: () => fetchTransactions({ personId: person?.id, limit: 50 }),
    enabled: Boolean(person?.id && isOpen),
  })

  const transactions = txData?.data ?? []

  // Calculate Metrics dynamically
  const { currentMonthSpent, categoryBreakdown, avgPerTx } = useMemo(() => {
    if (!transactions.length) {
      return { currentMonthSpent: 0, categoryBreakdown: [], avgPerTx: 0 }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let monthSum = 0
    let totalSum = 0
    const catMap: Record<string, { name: string; amount: number; count: number }> = {}

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0
      totalSum += amt

      const d = new Date(tx.date)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        monthSum += amt
      }

      // Group by category
      const subCat = subCategories.find((c) => c.id === tx.subCategoryId)
      const catName = subCat?.name || getSubCategoryName(tx.subCategoryId) || 'General'
      if (!catMap[catName]) {
        catMap[catName] = { name: catName, amount: 0, count: 0 }
      }
      catMap[catName].amount += amt
      catMap[catName].count += 1
    })

    const categoriesArray = Object.values(catMap)
      .map((cat) => ({
        ...cat,
        percentage: totalSum > 0 ? Math.round((cat.amount / totalSum) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const avg = transactions.length > 0 ? totalSum / transactions.length : 0

    return {
      currentMonthSpent: monthSum,
      categoryBreakdown: categoriesArray,
      avgPerTx: avg,
    }
  }, [transactions, subCategories])

  if (!person) return null

  const color = person.color || '#3b82f6'
  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleGoToTransactions = () => {
    onClose()
    navigate(`/transactions?personId=${person.id}`)
  }

  const getWalletName = (walletId?: string) => {
    if (!walletId) return 'Default Account'
    const match = wallets.find((w) => w.id === walletId)
    return match ? `${match.name}` : 'Account'
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title="Spending Analytics"
      className="max-w-md w-full"
    >
      <div className="space-y-6 pb-6">
        {/* Profile Hero Header */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/20 p-5">
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: color }}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-base font-bold shadow-sm"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  border: `1.5px solid ${color}40`,
                }}
              >
                {initials || <User className="h-6 w-6" />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground leading-snug">{person.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-medium text-xs">
                    {person.relationship}
                  </Badge>
                  {person.isArchived && (
                    <Badge variant="secondary" className="text-[10px]">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  onClose()
                  onEdit(person)
                }}
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>

          {person.notes && (
            <p className="text-xs text-muted-foreground mt-3 italic bg-background/60 p-2.5 rounded-lg border border-border/40">
              "{person.notes}"
            </p>
          )}
        </div>

        {/* Quick Analytics Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* All-time Spent */}
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
              Total Spent
            </span>
            <div className="text-base font-bold text-foreground font-mono mt-0.5 truncate">
              <NumberTicker value={person.totalSpent} prefix={`${currency} `} decimals={0} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
              {person.transactionCount} txns
            </span>
          </div>

          {/* Current Month Spent */}
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
              This Month
            </span>
            <div className="text-base font-bold text-destructive font-mono mt-0.5 truncate">
              {currency} {currentMonthSpent.toFixed(0)}
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block truncate flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span>Current</span>
            </span>
          </div>

          {/* Avg Per Transaction */}
          <div className="rounded-xl border border-border/70 bg-card p-3 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
              Avg / Expense
            </span>
            <div className="text-base font-bold text-foreground font-mono mt-0.5 truncate">
              {currency} {avgPerTx.toFixed(0)}
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
              Per purchase
            </span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <PieChart className="h-3.5 w-3.5 text-primary" />
              <span>Category Breakdown</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {categoryBreakdown.length} {categoryBreakdown.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No categorized expenses recorded yet.
            </p>
          ) : (
            <div className="space-y-3 pt-1">
              {categoryBreakdown.map((cat, idx) => {
                // Generate a consistent palette color
                const barColors = ['bg-primary', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500']
                const barColor = barColors[idx % barColors.length]

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[180px]">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground text-[11px]">
                          {currency} {cat.amount.toFixed(2)}
                        </span>
                        <span className="font-semibold text-foreground">{cat.percentage}%</span>
                      </div>
                    </div>
                    {/* Progress Track */}
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Receipt className="h-3.5 w-3.5 text-primary" />
              <span>Expense History ({transactions.length})</span>
            </div>
            {transactions.length > 0 && (
              <button
                type="button"
                onClick={handleGoToTransactions}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>View Full Table</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
              <TrendingDown className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">No expenses recorded yet</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px] mx-auto">
                When adding an expense, select <strong>{person.name}</strong> under the "Spent For"
                field to see transactions here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {transactions.map((tx) => {
                const subCat = subCategories.find((c) => c.id === tx.subCategoryId)
                const dateStr = new Date(tx.date).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-semibold text-foreground truncate max-w-[190px]">
                        {tx.notes || subCat?.name || 'Expense'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <WalletIcon className="h-3 w-3" />
                          {getWalletName(tx.walletId)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-destructive">
                        - {currency} {Number(tx.amount).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block max-w-[100px]">
                        {subCat?.name || getSubCategoryName(tx.subCategoryId)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-border/60 flex gap-2">
          <Button
            onClick={handleGoToTransactions}
            className="w-full gap-2 text-xs"
            variant="default"
          >
            <span>Open in Transactions Table</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
