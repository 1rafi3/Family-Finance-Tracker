import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Landmark,
  Plus,
  Search,
} from 'lucide-react'
import type { Loan, LoanCreateInput, LoanUpdateInput } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { LoanCard } from './components/LoanCard'
import { LoanModal } from './components/LoanModal'
import { LoanRepayModal } from './components/LoanRepayModal'
import { LoanStatsWidget } from './components/LoanStatsWidget'
import { useLoans } from './useLoans'

type TabFilter = 'ALL' | 'LENT' | 'BORROWED' | 'OVERDUE' | 'SETTLED'

export default function LoansPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null)
  const [loanToRepay, setLoanToRepay] = useState<Loan | null>(null)

  const {
    loans,
    isLoading,
    createLoan,
    updateLoan,
    archiveLoan,
    recordRepayment,
    isSubmitting,
  } = useLoans()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filtered loans
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = l.counterpartyName.toLowerCase().includes(q)
        const matchNotes = l.notes?.toLowerCase().includes(q)
        if (!matchName && !matchNotes) return false
      }

      const isPaid = l.status === 'PAID' || parseFloat(l.remainingBalance) <= 0
      const isOverdue =
        !isPaid &&
        (l.status === 'OVERDUE' || (l.dueDate ? new Date(l.dueDate).getTime() < today.getTime() : false))

      if (activeTab === 'LENT') return l.direction === 'LENT' && !isPaid
      if (activeTab === 'BORROWED') return l.direction === 'BORROWED' && !isPaid
      if (activeTab === 'OVERDUE') return isOverdue
      if (activeTab === 'SETTLED') return isPaid
      return true
    })
  }, [loans, searchQuery, activeTab])

  const lentCount = loans.filter((l) => l.direction === 'LENT' && l.status !== 'PAID').length
  const borrowedCount = loans.filter((l) => l.direction === 'BORROWED' && l.status !== 'PAID').length
  const overdueCount = loans.filter((l) => {
    const isPaid = l.status === 'PAID' || parseFloat(l.remainingBalance) <= 0
    return (
      !isPaid &&
      (l.status === 'OVERDUE' || (l.dueDate ? new Date(l.dueDate).getTime() < today.getTime() : false))
    )
  }).length
  const settledCount = loans.filter((l) => l.status === 'PAID' || parseFloat(l.remainingBalance) <= 0).length

  // Handlers
  const handleOpenCreate = () => {
    setLoanToEdit(null)
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (loan: Loan) => {
    setLoanToEdit(loan)
    setIsCreateModalOpen(true)
  }

  const handleOpenRepay = (loan: Loan) => {
    setLoanToRepay(loan)
  }

  const handleSaveLoan = async (data: LoanCreateInput | LoanUpdateInput) => {
    try {
      if (loanToEdit) {
        await updateLoan({ id: loanToEdit.id, data })
        toast('Debt record has been updated successfully.', 'success')
      } else {
        await createLoan(data as LoanCreateInput)
        toast('New debt has been added to your ledger.', 'success')
      }
      setIsCreateModalOpen(false)
      setLoanToEdit(null)
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not save loan record.', 'error')
    }
  }

  const handleArchiveLoan = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this debt record?')) return
    try {
      await archiveLoan(id)
      toast('Debt record was removed from view.', 'info')
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not archive loan.', 'error')
    }
  }

  const handleRepayConfirm = async (data: {
    id: string
    repaymentAmount: number
    currentBalance: number
  }) => {
    try {
      await recordRepayment(data)
      const isSettled = data.currentBalance - data.repaymentAmount <= 0
      toast(
        isSettled
          ? 'Outstanding balance reached zero and was marked as Paid! 🎉'
          : `Recorded BDT ${data.repaymentAmount.toLocaleString()} towards settlement.`,
        'success',
      )
    } catch (err: unknown) {
      toast((err as Error)?.message || 'Could not record repayment.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-primary" />
            Loans & Debts Tracker (ধার ও ঋণ)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Keep track of money lent to friends, personal borrowings, and settlement progress
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Record Loan / Debt
        </Button>
      </div>

      {/* KPI Stats Widget */}
      <LoanStatsWidget loans={loans} currency="BDT" />

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center rounded-lg border border-border/70 bg-card p-1 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab('LENT')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'LENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Owed to Me ({lentCount})
          </button>
          <button
            onClick={() => setActiveTab('BORROWED')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'BORROWED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            I Owe ({borrowedCount})
          </button>
          {overdueCount > 0 && (
            <button
              onClick={() => setActiveTab('OVERDUE')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'OVERDUE'
                  ? 'bg-destructive text-destructive-foreground shadow-xs'
                  : 'text-destructive hover:bg-destructive/10'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Overdue ({overdueCount})
            </button>
          )}
          <button
            onClick={() => setActiveTab('SETTLED')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'SETTLED'
                ? 'bg-muted text-foreground font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Settled ({settledCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search person or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Grid of Loans */}
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
      ) : filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              currency="BDT"
              onEdit={handleOpenEdit}
              onArchive={handleArchiveLoan}
              onRepay={handleOpenRepay}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Landmark className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {searchQuery ? 'No matching loan records found' : 'No debts or loans recorded yet'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? 'Try modifying your search query or switching active filter tabs.'
              : 'Add money you lent to friends or relatives, or log any personal liabilities to keep clean books!'}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleOpenCreate}
              className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Record First Loan or Debt
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <LoanModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setLoanToEdit(null)
        }}
        loanToEdit={loanToEdit}
        onSubmit={handleSaveLoan}
        isSubmitting={isSubmitting}
        currency="BDT"
      />

      <LoanRepayModal
        isOpen={Boolean(loanToRepay)}
        onClose={() => setLoanToRepay(null)}
        loan={loanToRepay}
        onRepay={handleRepayConfirm}
        isSubmitting={isSubmitting}
        currency="BDT"
      />
    </div>
  )
}
