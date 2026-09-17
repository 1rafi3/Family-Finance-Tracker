import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreatePersonInput, UpdatePersonInput } from '@family-finance/shared'
import { peopleApi } from './people.api'

export const PEOPLE_QUERY_KEY = ['people']

export function usePeople(isArchived = false) {
  const queryClient = useQueryClient()

  const peopleQuery = useQuery({
    queryKey: [...PEOPLE_QUERY_KEY, isArchived],
    queryFn: () => peopleApi.list(isArchived),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePersonInput) => peopleApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonInput }) =>
      peopleApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => peopleApi.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY })
    },
  })

  return {
    people: peopleQuery.data ?? [],
    isLoading: peopleQuery.isLoading,
    isError: peopleQuery.isError,
    error: peopleQuery.error,
    createPerson: createMutation.mutateAsync,
    updatePerson: updateMutation.mutateAsync,
    archivePerson: archiveMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending || updateMutation.isPending || archiveMutation.isPending,
  }
}
