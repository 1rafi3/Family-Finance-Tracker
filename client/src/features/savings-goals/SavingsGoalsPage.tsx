import { useMemo, useState } from 'react'
import {
  PiggyBank,
  Plus,
  Search,
} from 'lucide-react'
import type { SavingsGoal, SavingsGoalCreateInput, SavingsGoalUpdateInput } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { SavingsDepositModal } from './components/SavingsDepositModal'
import { SavingsGoalCard } from './components/SavingsGoalCard'
import { SavingsGoalModal } from './components/SavingsGoalModal'
import { SavingsGoalStatsWidget } from './components/SavingsGoalStatsWidget'
import { useSavingsGoals } from './useSavingsGoals'

type GoalFilter = 'ALL' | 'ACTIVE' | 'COMPLETED'

export default function SavingsGoalsPage() {
  const { toast } = useToast()
  const [activeFilter, setActiveFilter] = useState<GoalFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null)
  const [goalToDeposit, setGoalToDeposit] = useState<SavingsGoal | null>(null)

  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    archiveGoal,
    depositToGoal,
    isSubmitting,
  } = useSavingsGoals()

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = g.name.toLowerCase().includes(q)
        const notesMatch = g.notes?.toLowerCase().includes(q)
        if (!nameMatch && !notesMatch) return false
      }

      // Status filter
      const isCompleted = g.status === 'COMPLETED' || parseFloat(g.currentAmount) >= parseFloat(g.targetAmount)
      if (activeFilter === 'ACTIVE') return !isCompleted && g.status !== 'CANCELLED'
      if (activeFilter === 'COMPLETED') return isCompleted
      return true
    })
  }, [goals, searchQuery, activeFilter])

  const activeGoalsCount = goals.filter((g) => g.status === 'ACTIVE' && parseFloat(g.currentAmount) < parseFloat(g.targetAmount)).length
  const completedGoalsCount = goals.filter((g) => g.status === 'COMPLETED' || parseFloat(g.currentAmount) >= parseFloat(g.targetAmount)).length

  // Handlers
  const handleOpenCreate = () => {
    setGoalToEdit(null)
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (goal: SavingsGoal) => {
    setGoalToEdit(goal)
    setIsCreateModalOpen(true)
  }

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setGoalToDeposit(goal)
  }

  const handleSaveGoal = async (data: SavingsGoalCreateInput | SavingsGoalUpdateInput) => {
    try {
      if (goalToEdit) {
        await updateGoal({ id: goalToEdit.id, data })
        toast('Savings goal was successfully updated.', 'success')
      } else {
        await createGoal(data as SavingsGoalCreateInput)
        toast('New savings goal has been created.', 'success')
      }
      setIsCreateModalOpen(false)
      setGoalToEdit(null)
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not save savings goal.', 'error')
    }
  }

  const handleArchiveGoal = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this savings goal?')) return
    try {
      await archiveGoal(id)
      toast('The savings goal was archived.', 'info')
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not archive savings goal.', 'error')
    }
  }

  const handleDepositConfirm = async (data: {
    id: string
    amount: number
    currentSaved: number
    targetAmount: number
  }) => {
    try {
      await depositToGoal(data)
      const isNowCompleted = data.currentSaved + data.amount >= data.targetAmount
      toast(
        isNowCompleted
          ? 'Congratulations! You reached your savings target! 🎉'
          : `Added BDT ${data.amount.toLocaleString()} to your goal.`,
        'success',
      )
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not record deposit.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <PiggyBank className="h-6 w-6 text-primary" />
            Savings Goals (সঞ্চয় লক্ষ্যমাত্রা)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan, deposit, and track progress toward your family savings milestones
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Savings Goal
        </Button>
      </div>

      {/* KPI Stats Widget */}
      <SavingsGoalStatsWidget goals={goals} currency="BDT" />

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center rounded-lg border border-border/70 bg-card p-1 shadow-sm gap-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Goals ({goals.length})
          </button>
          <button
            onClick={() => setActiveFilter('ACTIVE')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'ACTIVE'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            In Progress ({activeGoalsCount})
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed 🎉 ({completedGoalsCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Grid of Savings Goals */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              currency="BDT"
              onEdit={handleOpenEdit}
              onArchive={handleArchiveGoal}
              onDeposit={handleOpenDeposit}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <PiggyBank className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {searchQuery ? 'No matching savings goals found' : 'No savings goals created yet'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query or switching the active tab filter.'
              : 'Create your first goal like an Emergency Fund, Eid Shopping, or Family Tour to start accumulating funds!'}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleOpenCreate}
              className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create First Savings Goal
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <SavingsGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setGoalToEdit(null)
        }}
        goalToEdit={goalToEdit}
        onSubmit={handleSaveGoal}
        isSubmitting={isSubmitting}
        currency="BDT"
      />

      <SavingsDepositModal
        isOpen={Boolean(goalToDeposit)}
        onClose={() => setGoalToDeposit(null)}
        goal={goalToDeposit}
        onDeposit={handleDepositConfirm}
        isSubmitting={isSubmitting}
        currency="BDT"
      />
    </div>
  )
}
