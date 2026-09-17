import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CategoryType,
  SubCategoryCreateInput,
  SubCategoryUpdateInput,
  SuperCategoryCreateInput,
  SuperCategoryUpdateInput,
} from '@family-finance/shared'
import { categoriesApi } from './categories.api'

export const CATEGORIES_QUERY_KEY = ['categories']

export function useCategories(type?: CategoryType, isArchived = false) {
  const queryClient = useQueryClient()

  const superCategoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'super', type, isArchived],
    queryFn: () => categoriesApi.getSuperCategories(type, isArchived),
  })

  const subCategoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'sub', type, isArchived],
    queryFn: () => categoriesApi.getSubCategories(undefined, type, isArchived),
  })

  const createSuperCategoryMutation = useMutation({
    mutationFn: (data: SuperCategoryCreateInput) => categoriesApi.createSuperCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  const updateSuperCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SuperCategoryUpdateInput }) =>
      categoriesApi.updateSuperCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  const archiveSuperCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.archiveSuperCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  const createSubCategoryMutation = useMutation({
    mutationFn: (data: SubCategoryCreateInput) => categoriesApi.createSubCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  const updateSubCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubCategoryUpdateInput }) =>
      categoriesApi.updateSubCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  const archiveSubCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.archiveSubCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })

  return {
    superCategories: superCategoriesQuery.data ?? [],
    subCategories: subCategoriesQuery.data ?? [],
    isLoading: superCategoriesQuery.isLoading || subCategoriesQuery.isLoading,
    isError: superCategoriesQuery.isError || subCategoriesQuery.isError,
    error: superCategoriesQuery.error || subCategoriesQuery.error,
    createSuperCategory: createSuperCategoryMutation.mutateAsync,
    updateSuperCategory: updateSuperCategoryMutation.mutateAsync,
    archiveSuperCategory: archiveSuperCategoryMutation.mutateAsync,
    createSubCategory: createSubCategoryMutation.mutateAsync,
    updateSubCategory: updateSubCategoryMutation.mutateAsync,
    archiveSubCategory: archiveSubCategoryMutation.mutateAsync,
    isSubmitting:
      createSuperCategoryMutation.isPending ||
      updateSuperCategoryMutation.isPending ||
      archiveSuperCategoryMutation.isPending ||
      createSubCategoryMutation.isPending ||
      updateSubCategoryMutation.isPending ||
      archiveSubCategoryMutation.isPending,
  }
}
