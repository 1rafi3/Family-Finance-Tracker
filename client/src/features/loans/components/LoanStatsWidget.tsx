import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CheckCircle2, Scale, ShieldAlert } from 'lucide-react'
import type { Loan } from '@family-finance/shared'

interface LoanStatsWidgetProps {
  loans: Loan[]
  currency?: string
}

export function LoanStatsWidget({ loans, currency = 'BDT' }: LoanStatsWidgetProps) {
  const activeLoans = loans.filter((l) => !l.isArchived)

  // Lent (I gave money, so counterparty owes me)
  const lentLoans = activeLoans.filter((l) => l.direction === 'LENT')
  const totalLentRemaining = lentLoans
    .filter((l) => l.status !== 'PAID')
    .reduce((sum, l) => sum + (parseFloat(l.remainingBalance) || 0), 0)

  // Borrowed (I took money, so I owe counterparty)
  const borrowedLoans = activeLoans.filter((l) => l.direction === 'BORROWED')
  const totalBorrowedRemaining = borrowedLoans
    .filter((l) => l.status !== 'PAID')
    .reduce((sum, l) => sum + (parseFloat(l.remainingBalance) || 0), 0)

  // Net Position = (Owed to Me) - (I Owe)
  const netPosition = totalLentRemaining - totalBorrowedRemaining

  // Overdue count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueCount = activeLoans.filter((l) => {
    if (l.status === 'PAID' || l.status === 'CANCELLED') return false
    if (l.status === 'OVERDUE') return true
    if (l.dueDate) {
      return new Date(l.dueDate).getTime() < today.getTime()
    }
    return false
  }).length

  const pendingCount = activeLoans.filter((l) => l.status !== 'PAID' && l.status !== 'CANCELLED').length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Lent / Owed to Me */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-emerald-500/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Owed to Me (পাওনা টাকা)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {currency} {totalLentRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Lent across {lentLoans.length} {lentLoans.length === 1 ? 'person' : 'persons'}
        </p>
      </div>

      {/* 2. Total Borrowed / I Owe */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-amber-500/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            I Owe (দেনা টাকা)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          {currency} {totalBorrowedRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Borrowed from {borrowedLoans.length} {borrowedLoans.length === 1 ? 'source' : 'sources'}
        </p>
      </div>

      {/* 3. Net Position */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-primary/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Net Balance (পাওনা বনাম দেনা)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div
          className={`font-mono text-2xl font-bold tracking-tight ${
            netPosition >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {netPosition >= 0 ? '+' : ''}
          {currency} {netPosition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {netPosition >= 0 ? 'You are a net creditor (পাওনা বেশি)' : 'You have net debts to pay (দেনা বেশি)'}
        </p>
      </div>

      {/* 4. Active & Overdue Health */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-border transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pending Settlements
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              overdueCount > 0
                ? 'bg-rose-500/10 text-destructive'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {overdueCount > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
          <span>{pendingCount}</span>
          <span className="text-sm font-normal text-muted-foreground">active debts</span>
        </div>
        <div className="mt-1 text-[11px]">
          {overdueCount > 0 ? (
            <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> {overdueCount} {overdueCount === 1 ? 'debt is' : 'debts are'} overdue
            </span>
          ) : (
            <span className="text-muted-foreground font-medium">All dues up to date</span>
          )}
        </div>
      </div>
    </div>
  )
}
