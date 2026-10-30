import { useState } from 'react'
import {
  AlertTriangle,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  Edit2,
  MoreVertical,
} from 'lucide-react'
import type { Loan } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

interface LoanCardProps {
  loan: Loan
  currency?: string
  onEdit: (loan: Loan) => void
  onArchive: (id: string) => void
  onRepay: (loan: Loan) => void
}

export function LoanCard({
  loan,
  currency = 'BDT',
  onEdit,
  onArchive,
  onRepay,
}: LoanCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const principal = parseFloat(loan.principal) || 0
  const remaining = parseFloat(loan.remainingBalance) || 0
  const repaid = Math.max(0, principal - remaining)
  const repaidPercent = principal > 0 ? Math.min(100, Math.round((repaid / principal) * 100)) : 0

  const isLent = loan.direction === 'LENT'
  const isPaid = loan.status === 'PAID' || remaining <= 0

  // Due date countdown
  let dueInfo: { label: string; isOverdue: boolean; isSoon: boolean } | null = null
  if (loan.dueDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(loan.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0 && !isPaid) {
      dueInfo = {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        isOverdue: true,
        isSoon: false,
      }
    } else if (diffDays === 0 && !isPaid) {
      dueInfo = {
        label: 'Due Today!',
        isOverdue: false,
        isSoon: true,
      }
    } else if (diffDays <= 15 && !isPaid) {
      dueInfo = {
        label: `Due in ${diffDays} days`,
        isOverdue: false,
        isSoon: true,
      }
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      dueInfo = {
        label: `Due: ${dueDate.getDate()} ${monthNames[dueDate.getMonth()]} ${dueDate.getFullYear()}`,
        isOverdue: false,
        isSoon: false,
      }
    }
  }

  return (
    <SpotlightCard className="relative overflow-visible border-border/70 bg-card p-5 transition-all duration-200 hover:shadow-md">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
              isPaid
                ? 'bg-muted text-muted-foreground'
                : isLent
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
            )}
          >
            {isPaid ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : isLent ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownLeft className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-base tracking-tight truncate" title={loan.counterpartyName}>
              {loan.counterpartyName}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {isLent ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lent to them (পাওনা)</span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">Borrowed by you (দেনা)</span>
              )}
              {loan.termMonths ? ` • ${loan.termMonths} mo` : ''}
            </p>
          </div>
        </div>

        {/* Status Badge & Action Menu */}
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Fully Settled 🎉
            </Badge>
          ) : dueInfo?.isOverdue ? (
            <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 text-[11px] font-semibold py-0.5">
              <AlertTriangle className="h-3 w-3" /> Overdue
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                'text-[11px] font-semibold',
                isLent
                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5',
              )}
            >
              {repaidPercent}% Repaid
            </Badge>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Loan options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit(loan)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" /> Edit Debt
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onArchive(loan.id)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amounts and Progress Bar */}
      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Outstanding Balance (বাকি)
            </span>
            <div
              className={cn(
                'font-mono text-xl font-bold',
                isPaid ? 'text-muted-foreground' : isLent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
              )}
            >
              {currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Principal (মূল)
            </span>
            <div className="font-mono text-base font-semibold text-muted-foreground">
              {currency} {principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Visual Repayment Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60 relative">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              isPaid
                ? 'bg-emerald-500'
                : isLent
                ? 'bg-emerald-500'
                : 'bg-rose-500',
            )}
            style={{ width: `${Math.max(3, repaidPercent)}%` }}
          />
        </div>

        {/* Bottom Details Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground font-medium">
            {isPaid ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                No balance remaining
              </span>
            ) : (
              <span>
                Repaid:{' '}
                <strong className="text-foreground font-semibold">
                  {currency} {repaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </span>
            )}
          </span>

          {dueInfo ? (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                dueInfo.isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : dueInfo.isSoon
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-muted-foreground',
              )}
            >
              <Clock className="h-3 w-3" />
              {dueInfo.label}
            </span>
          ) : (
            <span className="text-muted-foreground text-[11px]">No due date</span>
          )}
        </div>
      </div>

      {/* Notes if provided */}
      {loan.notes && (
        <div className="mt-3 rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          {loan.notes}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(loan)}
        >
          <Edit2 className="h-3 w-3 mr-1" /> Edit
        </Button>

        <Button
          variant={isPaid ? 'secondary' : 'default'}
          size="sm"
          disabled={isPaid}
          className={cn(
            'h-8 px-3 text-xs font-semibold shadow-sm transition-all',
            !isPaid && isLent && 'bg-emerald-600 hover:bg-emerald-700 text-white',
            !isPaid && !isLent && 'bg-rose-600 hover:bg-rose-700 text-white',
          )}
          onClick={() => onRepay(loan)}
        >
          <Coins className="h-3.5 w-3.5 mr-1" />
          {isPaid
            ? 'Fully Repaid'
            : isLent
            ? 'Record Collection (টাকা গ্রহণ)'
            : 'Record Payment (টাকা পরিশোধ)'}
        </Button>
      </div>
    </SpotlightCard>
  )
}
