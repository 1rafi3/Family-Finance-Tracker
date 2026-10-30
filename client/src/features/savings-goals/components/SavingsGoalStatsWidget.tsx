import { CheckCircle2, Flame, PiggyBank, Sparkles, Target, TrendingUp } from 'lucide-react'
import type { SavingsGoal } from '@family-finance/shared'

interface SavingsGoalStatsWidgetProps {
  goals: SavingsGoal[]
  currency?: string
}

export function SavingsGoalStatsWidget({ goals, currency = 'BDT' }: SavingsGoalStatsWidgetProps) {
  const activeGoals = goals.filter((g) => !g.isArchived)
  const totalTarget = activeGoals.reduce((sum, g) => sum + (parseFloat(g.targetAmount) || 0), 0)
  const totalSaved = activeGoals.reduce((sum, g) => sum + (parseFloat(g.currentAmount) || 0), 0)
  const remaining = Math.max(0, totalTarget - totalSaved)
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0

  const completedCount = activeGoals.filter((g) => g.status === 'COMPLETED' || parseFloat(g.currentAmount) >= parseFloat(g.targetAmount)).length
  const inProgressCount = activeGoals.filter((g) => g.status === 'ACTIVE' && parseFloat(g.currentAmount) < parseFloat(g.targetAmount)).length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Target */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-primary/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Target (মোট লক্ষ্য)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
          {currency} {totalTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Across {activeGoals.length} {activeGoals.length === 1 ? 'savings goal' : 'savings goals'}
        </p>
      </div>

      {/* 2. Total Saved */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-emerald-500/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Saved (মোট সঞ্চিত)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PiggyBank className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {currency} {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{overallProgress}%</span> achieved overall
        </p>
      </div>

      {/* 3. Remaining Gap */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-blue-500/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Remaining Gap (বাকি লক্ষ্য)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
          {currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {inProgressCount} {inProgressCount === 1 ? 'goal' : 'goals'} currently accumulating
        </p>
      </div>

      {/* 4. Milestones Achieved */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-amber-500/30 transition-all duration-200">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Achieved Milestones (পূরণকৃত)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
          <span>{completedCount}</span>
          <span className="text-sm font-normal text-muted-foreground">/ {activeGoals.length} goals</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {completedCount > 0 ? (
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Great saving discipline!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Flame className="h-3 w-3 text-amber-500" /> Start depositing today
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
