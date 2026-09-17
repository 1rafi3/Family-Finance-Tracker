import { AlertTriangle, CheckCircle2, Edit2, FolderTree, Trash2, User, Zap } from 'lucide-react'
import type { BudgetWithAnalytics } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { useCategories } from '@/features/categories/useCategories'
import { usePeople } from '@/features/people/usePeople'

interface BudgetCardProps {
  budget: BudgetWithAnalytics
  onEdit: (budget: BudgetWithAnalytics) => void
  onDelete: (budget: BudgetWithAnalytics) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { people } = usePeople()
  const { superCategories, subCategories } = useCategories()

  const isPerson = budget.targetType === 'PERSON'
  const person = isPerson ? people.find((p) => p.id === budget.personId) : null

  const superCat = !isPerson ? superCategories.find((c) => c.id === budget.superCategoryId) : null
  const subCat = budget.subCategoryId ? subCategories.find((c) => c.id === budget.subCategoryId) : null

  const targetName = isPerson
    ? person?.name || 'Assigned Person'
    : subCat?.name || superCat?.name || 'Category'

  const secondaryLabel = isPerson
    ? person?.relationship ? `${person.relationship} Allowance` : 'Dependent Allowance'
    : superCat?.name || 'Expense Category'

  const limitNum = parseFloat(budget.amount) || 0
  const spentNum = budget.spent || 0
  const pct = budget.percentage || 0
  const isExceeded = budget.status === 'EXCEEDED'
  const isWarning = budget.status === 'WARNING'

  const progressBarWidth = Math.min(pct, 100)

  return (
    <SpotlightCard
      className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
      spotlightColor={
        isExceeded
          ? 'rgba(239, 68, 68, 0.08)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.08)'
          : 'rgba(59, 130, 246, 0.08)'
      }
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {isPerson ? (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: person?.color || '#3b82f6' }}
              >
                {person?.avatar || person?.name.slice(0, 2).toUpperCase() || <User className="h-5 w-5" />}
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <FolderTree className="h-5 w-5" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground tracking-tight text-base group-hover:text-primary transition-colors">
                  {targetName}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {budget.name ? `${budget.name} • ` : ''}
                {secondaryLabel}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isExceeded ? (
              <Badge variant="destructive" className="flex items-center gap-1 font-semibold px-2 py-0.5 text-[11px]">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{pct}% Exceeded</span>
              </Badge>
            ) : isWarning ? (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 font-semibold px-2 py-0.5 text-[11px]">
                <Zap className="h-3 w-3 shrink-0" />
                <span>{pct}% Nearing</span>
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium px-2 py-0.5 text-[11px]">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>{pct}% On Track</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Amount & Progress Section */}
        <div className="mt-5 space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <div>
              <span className="font-mono text-lg font-bold text-foreground tracking-tight">
                BDT {spentNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                of {limitNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              {isExceeded ? (
                <span className="text-xs font-semibold text-destructive">
                  Over by BDT {Math.abs(budget.remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  BDT {budget.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} left
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExceeded
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-sm'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              }`}
              style={{ width: `${progressBarWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {budget.transactionCount} {budget.transactionCount === 1 ? 'transaction' : 'transactions'} this month
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(budget)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Edit Limit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(budget)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            title="Archive Budget"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </SpotlightCard>
  )
}
