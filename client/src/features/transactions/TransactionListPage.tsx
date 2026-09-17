import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeftRight, PlusCircle, RefreshCw } from 'lucide-react'
import type { Transaction } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { useWallets } from '@/features/wallets/useWallets'
import { CreateTransactionModal } from './components/CreateTransactionModal'
import { EditTransactionModal } from './components/EditTransactionModal'
import { TransactionCard } from './components/TransactionCard'
import { TransactionDetailDrawer } from './components/TransactionDetailDrawer'
import { TransactionEmptyState } from './components/TransactionEmptyState'
import { TransactionFilters } from './components/TransactionFilters'
import { TransactionSkeletonList } from './components/TransactionSkeleton'
import { TransactionTable } from './components/TransactionTable'
import { VoidTransactionDialog } from './components/VoidTransactionDialog'
import type { TransactionListQuery } from './transaction.service'
import { useInfiniteTransactions } from './useTransactions'

export function TransactionListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlPersonId = searchParams.get('personId') || undefined
  const urlWalletId = searchParams.get('walletId') || undefined

  const { data: walletsData } = useWallets()
  const wallets = walletsData ?? []

  const [filters, setFilters] = useState<TransactionListQuery>({
    limit: 15,
    personId: urlPersonId,
    walletId: urlWalletId,
  })

  // Sync URL changes to filters state if user navigates via deep-link
  useEffect(() => {
    if (urlPersonId !== filters.personId || urlWalletId !== filters.walletId) {
      setFilters((prev) => ({
        ...prev,
        personId: urlPersonId,
        walletId: urlWalletId,
      }))
    }
  }, [urlPersonId, urlWalletId])

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(filters)

  // Modals & Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [voidingTransaction, setVoidingTransaction] = useState<Transaction | null>(null)
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null)

  // Flatten all paginated pages into single array
  const allTransactions = data?.pages.flatMap((page) => page.data) ?? []
  const isFiltered = Boolean(
    filters.type ||
      filters.status ||
      filters.walletId ||
      filters.personId ||
      filters.search ||
      filters.dateFrom ||
      filters.dateTo,
  )

  const handleResetFilters = () => {
    setFilters({ limit: 15 })
    setSearchParams({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            <span>Transactions</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, search, and manage household financial activity
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <TransactionFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
        wallets={wallets}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <TransactionSkeletonList />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-semibold">Failed to load transactions</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : allTransactions.length === 0 ? (
        <TransactionEmptyState
          onCreateTransaction={() => setIsCreateOpen(true)}
          isFiltered={isFiltered}
          onResetFilters={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Responsive Layout: Desktop Table (md+) / Mobile Cards (<md) */}
          <div className="hidden md:block">
            <TransactionTable
              transactions={allTransactions}
              wallets={wallets}
              onView={(tx) => setDetailTransaction(tx)}
              onEdit={(tx) => setEditingTransaction(tx)}
              onVoid={(tx) => setVoidingTransaction(tx)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {allTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                wallets={wallets}
                onView={(t) => setDetailTransaction(t)}
                onEdit={(t) => setEditingTransaction(t)}
                onVoid={(t) => setVoidingTransaction(t)}
              />
            ))}
          </div>

          {/* Load More Pagination Button */}
          {hasNextPage ? (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => void fetchNextPage()}
                isLoading={isFetchingNextPage}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Load More Transactions</span>
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Modals & Dialogs */}
      <CreateTransactionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        wallets={wallets}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        wallets={wallets}
      />

      <VoidTransactionDialog
        transaction={voidingTransaction}
        isOpen={Boolean(voidingTransaction)}
        onClose={() => setVoidingTransaction(null)}
      />

      <TransactionDetailDrawer
        transaction={detailTransaction}
        isOpen={Boolean(detailTransaction)}
        onClose={() => setDetailTransaction(null)}
        wallets={wallets}
      />
    </div>
  )
}

export default TransactionListPage
