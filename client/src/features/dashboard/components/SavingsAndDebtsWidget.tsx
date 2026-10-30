import { Link } from 'react-router'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Landmark, PiggyBank } from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { useSavingsGoals } from '@/features/savings-goals/useSavingsGoals'
import { useLoans } from '@/features/loans/useLoans'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SavingsAndDebtsWidgetProps {
  currency?: string
}

export function SavingsAndDebtsWidget({ currency = 'BDT' }: SavingsAndDebtsWidgetProps) {
  const { goals, isLoading: isGoalsLoading } = useSavingsGoals()
  const { loans, isLoading: isLoansLoading } = useLoans()

  const isLoading = isGoalsLoading || isLoansLoading

  // Savings calculations
  const activeGoals = goals.filter((g) => !g.isArchived)
  const totalTarget = activeGoals.reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0)
  const totalSaved = activeGoals.reduce((sum, g) => sum + (parseFloat(g.currentAmount) || 0), 0)
  const overallSavingsPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0
  const topGoals = activeGoals.slice(0, 3)

  // Loans calculations
  const activeLoans = loans.filter((l) => !l.isArchived)
  const totalLent = activeLoans
    .filter((l) => l.direction === 'LENT' && l.status !== 'PAID')
    .reduce((sum, l) => sum + (parseFloat(l.remainingBalance) || 0), 0)
  const totalBorrowed = activeLoans
    .filter((l) => l.direction === 'BORROWED' && l.status !== 'PAID')
    .reduce((sum, l) => sum + (parseFloat(l.remainingBalance) || 0), 0)
  const topLoans = activeLoans.filter((l) => l.status !== 'PAID').slice(0, 3)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Card 1: Savings Goals Snapshot */}
      <SpotlightCard className="border-border/70 bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Savings Goals (সঞ্চয় লক্ষ্যমাত্রা)</h3>
              <p className="text-[11px] text-muted-foreground">
                {activeGoals.length} {activeGoals.length === 1 ? 'goal' : 'goals'} in progress
              </p>
            </div>
          </div>
          <Link
            to="/savings-goals"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : activeGoals.length > 0 ? (
          <div className="mt-4 space-y-3.5">
            {/* Aggregate Progress */}
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">Accumulated:</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {currency} {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })} / {totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({overallSavingsPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${overallSavingsPercent}%` }}
                />
              </div>
            </div>

            {/* Top goals mini list */}
            <div className="space-y-2">
              {topGoals.map((g) => {
                const target = parseFloat(g.targetAmount) || 1
                const current = parseFloat(g.currentAmount) || 0
                const pct = Math.min(100, Math.round((current / target) * 100))
                const done = g.status === 'COMPLETED' || pct >= 100
                return (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[170px]" title={g.name}>
                      {g.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        {currency} {current.toLocaleString()}
                      </span>
                      {done ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Done 🎉
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
            No savings goals yet.{' '}
            <Link to="/savings-goals" className="text-primary font-semibold hover:underline">
              Set your first target!
            </Link>
          </div>
        )}
      </SpotlightCard>

      {/* Card 2: Debts & Liabilities Snapshot */}
      <SpotlightCard className="border-border/70 bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Loans & Debts (ধার ও দেনা)</h3>
              <p className="text-[11px] text-muted-foreground">
                Receivables & personal liabilities
              </p>
            </div>
          </div>
          <Link
            to="/loans"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : activeLoans.length > 0 ? (
          <div className="mt-4 space-y-3.5">
            {/* Two Side Stat Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> Owed to Me (পাওনা)
                </span>
                <div className="font-mono text-sm font-bold text-foreground mt-0.5">
                  {currency} {totalLent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5">
                <span className="text-[10px] font-semibold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <ArrowDownLeft className="h-3 w-3" /> I Owe (দেনা)
                </span>
                <div className="font-mono text-sm font-bold text-foreground mt-0.5">
                  {currency} {totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Top debts mini list */}
            <div className="space-y-2">
              {topLoans.map((l) => {
                const rem = parseFloat(l.remainingBalance) || 0
                const isLent = l.direction === 'LENT'
                return (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[170px]" title={l.counterpartyName}>
                      {l.counterpartyName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                          isLent
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                        )}
                      >
                        {isLent ? 'Lent' : 'Owe'}
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {currency} {rem.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
            No active debts recorded.{' '}
            <Link to="/loans" className="text-primary font-semibold hover:underline">
              Log money lent or borrowed
            </Link>
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}
