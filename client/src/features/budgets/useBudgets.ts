import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BudgetCreateInput, BudgetUpdateInput } from '@family-finance/shared'
import { budgetApi } from './budget.api'

export const BUDGETS_QUERY_KEY = ['budgets']

export function useBudgets(year?: number, month?: number, includeArchived = false) {
  const queryClient = useQueryClient()
  const activeYear = year ?? new Date().getFullYear()
  const activeMonth = month ?? new Date().getMonth() + 1

  const budgetsQuery = useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, activeYear, activeMonth, includeArchived],
    queryFn: () => budgetApi.list(activeYear, activeMonth, includeArchived),
  })

  const createMutation = useMutation({
    mutationFn: (data: BudgetCreateInput) => budgetApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetUpdateInput }) =>
      budgetApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => budgetApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })

  return {
    budgets: budgetsQuery.data ?? [],
    isLoading: budgetsQuery.isLoading,
    isFetching: budgetsQuery.isFetching,
    isError: budgetsQuery.isError,
    error: budgetsQuery.error,
    createBudget: createMutation.mutateAsync,
    updateBudget: updateMutation.mutateAsync,
    archiveBudget: archiveMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || archiveMutation.isPending,
  }
}
