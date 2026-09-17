import type {
  CategoryType,
  SubCategory,
  SubCategoryCreateInput,
  SubCategoryUpdateInput,
  SuperCategory,
  SuperCategoryCreateInput,
  SuperCategoryUpdateInput,
} from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export const categoriesApi = {
  getSuperCategories: async (type?: CategoryType, isArchived = false): Promise<SuperCategory[]> => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (isArchived) params.append('isArchived', 'true')
    return apiClient.get<SuperCategory[]>(`/categories/super?${params.toString()}`)
  },

  getSubCategories: async (
    superCategoryId?: string,
    type?: CategoryType,
    isArchived = false,
  ): Promise<SubCategory[]> => {
    const params = new URLSearchParams()
    if (superCategoryId) params.append('superCategoryId', superCategoryId)
    if (type) params.append('type', type)
    if (isArchived) params.append('isArchived', 'true')
    return apiClient.get<SubCategory[]>(`/categories/sub?${params.toString()}`)
  },

  createSuperCategory: async (data: SuperCategoryCreateInput): Promise<SuperCategory> => {
    const res = await apiClient.post<{ superCategory: SuperCategory }>('/categories/super', data)
    return res.superCategory
  },

  updateSuperCategory: async (
    id: string,
    data: SuperCategoryUpdateInput,
  ): Promise<SuperCategory> => {
    const res = await apiClient.patch<{ superCategory: SuperCategory }>(
      `/categories/super/${id}`,
      data,
    )
    return res.superCategory
  },

  archiveSuperCategory: async (id: string): Promise<SuperCategory> => {
    const res = await apiClient.delete<{ superCategory: SuperCategory }>(
      `/categories/super/${id}`,
    )
    return res.superCategory
  },

  createSubCategory: async (data: SubCategoryCreateInput): Promise<SubCategory> => {
    const res = await apiClient.post<{ subCategory: SubCategory }>('/categories/sub', data)
    return res.subCategory
  },

  updateSubCategory: async (id: string, data: SubCategoryUpdateInput): Promise<SubCategory> => {
    const res = await apiClient.patch<{ subCategory: SubCategory }>(
      `/categories/sub/${id}`,
      data,
    )
    return res.subCategory
  },

  archiveSubCategory: async (id: string): Promise<SubCategory> => {
    const res = await apiClient.delete<{ subCategory: SubCategory }>(`/categories/sub/${id}`)
    return res.subCategory
  },
}
