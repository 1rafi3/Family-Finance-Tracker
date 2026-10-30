import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LoanCreateInput, LoanUpdateInput } from '@family-finance/shared'
import { loanApi } from './loan.api'

export const LOANS_QUERY_KEY = ['loans']

export function useLoans(includeArchived = false) {
  const queryClient = useQueryClient()

  const loansQuery = useQuery({
    queryKey: [...LOANS_QUERY_KEY, includeArchived],
    queryFn: () => loanApi.list(includeArchived),
  })

  const createMutation = useMutation({
    mutationFn: (data: LoanCreateInput) => loanApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LoanUpdateInput }) =>
      loanApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => loanApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY })
    },
  })

  const repayMutation = useMutation({
    mutationFn: ({
      id,
      repaymentAmount,
      currentBalance,
    }: {
      id: string
      repaymentAmount: number
      currentBalance: number
    }) => loanApi.recordRepayment(id, repaymentAmount, currentBalance),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOANS_QUERY_KEY })
    },
  })

  return {
    loans: loansQuery.data ?? [],
    isLoading: loansQuery.isLoading,
    isFetching: loansQuery.isFetching,
    isError: loansQuery.isError,
    error: loansQuery.error,
    createLoan: createMutation.mutateAsync,
    updateLoan: updateMutation.mutateAsync,
    archiveLoan: archiveMutation.mutateAsync,
    recordRepayment: repayMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      archiveMutation.isPending ||
      repayMutation.isPending,
  }
}
