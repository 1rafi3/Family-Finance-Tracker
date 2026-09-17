import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Plus,
  RotateCcw,
  Sparkles,
  User,
} from 'lucide-react'
import type { BudgetCreateInput, BudgetWithAnalytics } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { BudgetCard } from './components/BudgetCard'
import { BudgetModal } from './components/BudgetModal'
import { BudgetStatsWidget } from './components/BudgetStatsWidget'
import { useBudgets } from './useBudgets'

type TabFilter = 'ALL' | 'CATEGORIES' | 'PERSONS' | 'ALERTS'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function BudgetsPage() {
  const { toast } = useToast()
  const today = new Date()

  // Active viewing period (defaults to current month)
  const [activeYear, setActiveYear] = useState<number>(today.getFullYear())
  const [activeMonth, setActiveMonth] = useState<number>(today.getMonth() + 1)
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetWithAnalytics | null>(null)

  const {
    budgets,
    isLoading,
    isFetching,
    createBudget,
    updateBudget,
    archiveBudget,
    isSubmitting,
  } = useBudgets(activeYear, activeMonth)

  // Navigate month
  const handlePrevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12)
      setActiveYear((prev) => prev - 1)
    } else {
      setActiveMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1)
      setActiveYear((prev) => prev + 1)
    } else {
      setActiveMonth((prev) => prev + 1)
    }
  }

  const handleResetToCurrentMonth = () => {
    setActiveYear(today.getFullYear())
    setActiveMonth(today.getMonth() + 1)
  }

  const isCurrentMonth = activeYear === today.getFullYear() && activeMonth === today.getMonth() + 1

  // Filtered lists
  const categoryBudgets = useMemo(
    () => budgets.filter((b) => b.targetType === 'CATEGORY'),
    [budgets],
  )
  const personAllowances = useMemo(
    () => budgets.filter((b) => b.targetType === 'PERSON'),
    [budgets],
  )
  const alertBudgets = useMemo(
    () => budgets.filter((b) => b.status === 'EXCEEDED' || b.status === 'WARNING'),
    [budgets],
  )

  const displayedBudgets = useMemo(() => {
    switch (activeTab) {
      case 'CATEGORIES':
        return categoryBudgets
      case 'PERSONS':
        return personAllowances
      case 'ALERTS':
        return alertBudgets
      case 'ALL':
      default:
        return budgets
    }
  }, [activeTab, budgets, categoryBudgets, personAllowances, alertBudgets])

  // Exceeded banners
  const exceededBudgets = useMemo(
    () => budgets.filter((b) => b.status === 'EXCEEDED'),
    [budgets],
  )

  // Handlers
  const handleSaveBudget = async (data: BudgetCreateInput) => {
    try {
      if (budgetToEdit) {
        await updateBudget({
          id: budgetToEdit.id,
          data: {
            name: data.name,
            amount: data.amount,
            periodYear: data.periodYear,
            periodMonth: data.periodMonth,
          },
        })
        toast('Budget limit updated successfully', 'success')
      } else {
        await createBudget(data)
        toast('New budget established successfully', 'success')
      }
      setIsModalOpen(false)
      setBudgetToEdit(null)
    } catch (err: any) {
      toast(err?.message || 'Failed to save budget', 'error')
      throw err
    }
  }

  const handleArchive = async (budget: BudgetWithAnalytics) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove this ${
        budget.targetType === 'PERSON' ? 'allowance target' : 'category budget'
      }?`,
    )
    if (!confirmed) return

    try {
      await archiveBudget(budget.id)
      toast('Budget archived successfully', 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to remove budget', 'error')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Budgets & Spending Limits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enforce financial discipline across categories and set monthly allowance targets for dependents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setBudgetToEdit(null)
              setIsModalOpen(true)
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Budget / Allowance</span>
          </Button>
        </div>
      </div>

      {/* Period Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg border border-border/40">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-sm">
              {MONTH_NAMES[activeMonth - 1]} {activeYear}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToCurrentMonth}
              className="text-xs text-primary gap-1.5 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Current Month</span>
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {isFetching ? 'Updating real-time calculations...' : `Real-time calculations for ${MONTH_NAMES[activeMonth - 1]} ${activeYear}`}
        </div>
      </div>

      {/* Exceeded Overspending Alert Banner */}
      {exceededBudgets.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-sm flex items-start gap-3.5">
          <div className="rounded-lg bg-rose-500 text-white p-2 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm">
              Attention: {exceededBudgets.length} {exceededBudgets.length === 1 ? 'Budget Exceeded' : 'Budgets Exceeded'}
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">
              You have exceeded your planned monthly limit for{' '}
              <span className="font-semibold underline">
                {exceededBudgets.map((b) => b.name || b.targetType).join(', ')}
              </span>
              . Consider adjusting discretionary spending or reallocating budget room.
            </p>
          </div>
        </div>
      )}

      {/* KPI Stats Widget */}
      <BudgetStatsWidget budgets={budgets} />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <span>All Limits</span>
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {budgets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'CATEGORIES'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <FolderTree className="h-3.5 w-3.5" />
          <span>Category Budgets</span>
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {categoryBudgets.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PERSONS')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'PERSONS'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Person Allowances</span>
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {personAllowances.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALERTS')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'ALERTS'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Alerts & Nearing</span>
          <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
            {alertBudgets.length}
          </span>
        </button>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedBudgets.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            No budgets found for {MONTH_NAMES[activeMonth - 1]} {activeYear}
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Set up your first category spending limit or family member allowance to stay in total control of your cashflow.
          </p>
          <Button
            onClick={() => {
              setBudgetToEdit(null)
              setIsModalOpen(true)
            }}
            className="mt-6 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Budget / Allowance</span>
          </Button>
        </div>
      ) : (
        /* Active Cards Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayedBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={(b) => {
                setBudgetToEdit(b)
                setIsModalOpen(true)
              }}
              onDelete={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setBudgetToEdit(null)
        }}
        onSubmit={handleSaveBudget}
        budgetToEdit={budgetToEdit}
        activeYear={activeYear}
        activeMonth={activeMonth}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default BudgetsPage
