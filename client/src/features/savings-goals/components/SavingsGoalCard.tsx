import { useState } from 'react'
import {
  Archive,
  CheckCircle2,
  Clock,
  Edit2,
  MoreVertical,
  PiggyBank,
  Plus,
  Sparkles,
} from 'lucide-react'
import type { SavingsGoal } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

interface SavingsGoalCardProps {
  goal: SavingsGoal
  currency?: string
  onEdit: (goal: SavingsGoal) => void
  onArchive: (id: string) => void
  onDeposit: (goal: SavingsGoal) => void
}

export function SavingsGoalCard({
  goal,
  currency = 'BDT',
  onEdit,
  onArchive,
  onDeposit,
}: SavingsGoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const targetAmount = parseFloat(goal.targetAmount) || 0
  const currentAmount = parseFloat(goal.currentAmount) || 0
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const progressPercent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0
  const isCompleted = goal.status === 'COMPLETED' || progressPercent >= 100

  // Calculate days left to deadline
  let deadlineInfo: { label: string; isPast: boolean; isSoon: boolean } | null = null
  if (goal.deadline) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(goal.deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      deadlineInfo = {
        label: `${Math.abs(diffDays)}d past target date`,
        isPast: true,
        isSoon: false,
      }
    } else if (diffDays === 0) {
      deadlineInfo = {
        label: 'Target date is Today!',
        isPast: false,
        isSoon: true,
      }
    } else if (diffDays <= 30) {
      deadlineInfo = {
        label: `${diffDays} days remaining`,
        isPast: false,
        isSoon: true,
      }
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      deadlineInfo = {
        label: `Target: ${monthNames[deadlineDate.getMonth()]} ${deadlineDate.getFullYear()}`,
        isPast: false,
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
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-primary/10 text-primary',
            )}
          >
            {isCompleted ? <Sparkles className="h-5 w-5" /> : <PiggyBank className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-base tracking-tight truncate" title={goal.name}>
              {goal.name}
            </h3>
            {goal.notes ? (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={goal.notes}>
                {goal.notes}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Personal Savings Target</p>
            )}
          </div>
        </div>

        {/* Status Badge & Action Menu */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Achieved! 🎉
            </Badge>
          ) : goal.status === 'CANCELLED' ? (
            <Badge variant="outline" className="text-muted-foreground text-[11px]">
              Cancelled
            </Badge>
          ) : (
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[11px] font-semibold">
              {progressPercent}% Saved
            </Badge>
          )}

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Goal options"
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
                      onEdit(goal)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" /> Edit Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onArchive(goal.id)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive Goal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Amount Row */}
      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Saved
            </span>
            <div className="font-mono text-xl font-bold text-foreground">
              {currency} {currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Target
            </span>
            <div className="font-mono text-base font-semibold text-muted-foreground">
              {currency} {targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60 relative">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              isCompleted
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : progressPercent >= 75
                ? 'bg-teal-500'
                : progressPercent >= 40
                ? 'bg-primary'
                : 'bg-indigo-500',
            )}
            style={{ width: `${Math.max(3, progressPercent)}%` }}
          />
        </div>

        {/* Bottom Gap Info & Deadline */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground font-medium">
            {isCompleted ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Target completely reached!
              </span>
            ) : (
              <span>
                <strong className="text-foreground font-semibold">
                  {currency} {remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>{' '}
                to go
              </span>
            )}
          </span>

          {deadlineInfo ? (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                deadlineInfo.isPast
                  ? 'text-amber-600 dark:text-amber-400'
                  : deadlineInfo.isSoon
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground',
              )}
            >
              <Clock className="h-3 w-3" />
              {deadlineInfo.label}
            </span>
          ) : (
            <span className="text-muted-foreground text-[11px]">No deadline</span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(goal)}
        >
          <Edit2 className="h-3 w-3 mr-1" /> Edit
        </Button>

        <Button
          variant={isCompleted ? 'secondary' : 'default'}
          size="sm"
          className={cn(
            'h-8 px-3 text-xs font-semibold shadow-sm transition-all',
            !isCompleted && 'bg-emerald-600 hover:bg-emerald-700 text-white',
          )}
          onClick={() => onDeposit(goal)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {isCompleted ? 'Add More Funds' : 'Add Funds (টাকা জমা)'}
        </Button>
      </div>
    </SpotlightCard>
  )
}
