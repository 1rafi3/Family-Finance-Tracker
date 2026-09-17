import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'
import { walletKeys } from '@/features/wallets/useWallets'
import {
  createTransaction,
  fetchTransaction,
  fetchTransactions,
  updateTransaction,
  voidTransaction,
  type ClientTransactionCreateInput,
  type ClientTransactionUpdateInput,
  type TransactionListQuery,
} from './transaction.service'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionListQuery) => [...transactionKeys.lists(), filters] as const,
  infinite: (filters: TransactionListQuery) => [...transactionKeys.all, 'infinite', filters] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

// ── useTransactions (Paginated & Filtered) ───────────────────────────────────
export function useTransactions(filters: TransactionListQuery = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => fetchTransactions(filters),
  })
}

// ── useInfiniteTransactions (Cursor Infinite Scroll) ────────────────────────
export function useInfiniteTransactions(filters: Omit<TransactionListQuery, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.infinite(filters),
    queryFn: ({ pageParam }) =>
      fetchTransactions({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  })
}

// ── useTransaction ───────────────────────────────────────────────────────────
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => fetchTransaction(id),
    enabled: Boolean(id),
  })
}

// ── useCreateTransaction ─────────────────────────────────────────────────────
export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: ClientTransactionCreateInput) => createTransaction(input),
    onSuccess: (transaction) => {
      // Invalidate both transaction lists and wallet balances
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toast(`${transaction.type} transaction recorded`, 'success')
    },
    onError: () => {
      toast('Failed to record transaction. Please try again.', 'error')
    },
  })
}

// ── useUpdateTransaction ─────────────────────────────────────────────────────
export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientTransactionUpdateInput }) =>
      updateTransaction(id, input),
    onSuccess: (transaction) => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: walletKeys.all })
      queryClient.setQueryData(transactionKeys.detail(transaction.id), transaction)
      toast('Transaction updated', 'success')
    },
    onError: () => {
      toast('Failed to update transaction. Please try again.', 'error')
    },
  })
}

// ── useVoidTransaction ───────────────────────────────────────────────────────
export function useVoidTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => voidTransaction(id),
    onSuccess: (transaction) => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: walletKeys.all })
      queryClient.setQueryData(transactionKeys.detail(transaction.id), transaction)
      toast('Transaction voided successfully', 'info')
    },
    onError: () => {
      toast('Failed to void transaction. Please try again.', 'error')
    },
  })
}
