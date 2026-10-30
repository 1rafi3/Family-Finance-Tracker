import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SavingsGoalCreateInput, SavingsGoalUpdateInput } from '@family-finance/shared'
import { savingsGoalApi } from './savings-goal.api'

export const SAVINGS_GOALS_QUERY_KEY = ['savings-goals']

export function useSavingsGoals(includeArchived = false) {
  const queryClient = useQueryClient()

  const goalsQuery = useQuery({
    queryKey: [...SAVINGS_GOALS_QUERY_KEY, includeArchived],
    queryFn: () => savingsGoalApi.list(includeArchived),
  })

  const createMutation = useMutation({
    mutationFn: (data: SavingsGoalCreateInput) => savingsGoalApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SavingsGoalUpdateInput }) =>
      savingsGoalApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => savingsGoalApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY })
    },
  })

  const depositMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      currentSaved,
      targetAmount,
    }: {
      id: string
      amount: number
      currentSaved: number
      targetAmount: number
    }) => savingsGoalApi.deposit(id, amount, currentSaved, targetAmount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SAVINGS_GOALS_QUERY_KEY })
    },
  })

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    isFetching: goalsQuery.isFetching,
    isError: goalsQuery.isError,
    error: goalsQuery.error,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    archiveGoal: archiveMutation.mutateAsync,
    depositToGoal: depositMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      archiveMutation.isPending ||
      depositMutation.isPending,
  }
}
