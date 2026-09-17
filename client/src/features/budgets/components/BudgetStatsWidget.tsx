import { AlertTriangle, CheckCircle2, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import type { BudgetWithAnalytics } from '@family-finance/shared'

interface BudgetStatsWidgetProps {
  budgets: BudgetWithAnalytics[]
}

export function BudgetStatsWidget({ budgets }: BudgetStatsWidgetProps) {
  const totalBudgeted = budgets.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const netRemaining = totalBudgeted - totalSpent
  const adherence = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0

  const alertsCount = budgets.filter((b) => b.status === 'EXCEEDED' || b.status === 'WARNING').length
  const exceededCount = budgets.filter((b) => b.status === 'EXCEEDED').length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Budgeted */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Monthly Cap</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
          BDT {totalBudgeted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Across {budgets.length} active {budgets.length === 1 ? 'limit' : 'limits'}
        </p>
      </div>

      {/* 2. Total Spent */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Spent So Far</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
          BDT {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{adherence}%</span> of total allocated cap
        </p>
      </div>

      {/* 3. Remaining Buffer */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Remaining Buffer</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div
          className={`font-mono text-2xl font-bold tracking-tight ${
            netRemaining < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          BDT {netRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {netRemaining >= 0 ? 'Safe spending room' : 'Overall deficit across caps'}
        </p>
      </div>

      {/* 4. Alerts */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Budget Health</span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              exceededCount > 0
                ? 'bg-rose-500/10 text-destructive'
                : alertsCount > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {alertsCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
          {alertsCount} {alertsCount === 1 ? 'Alert' : 'Alerts'}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {exceededCount > 0
            ? `${exceededCount} exceeded limit`
            : alertsCount > 0
            ? '1 or more nearing limit'
            : 'All spending within limits'}
        </p>
      </div>
    </div>
  )
}
