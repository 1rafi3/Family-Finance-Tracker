import type {
  BudgetCreateInput,
  BudgetUpdateInput,
  BudgetWithAnalytics,
} from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export const budgetApi = {
  list: async (
    year?: number,
    month?: number,
    includeArchived = false,
  ): Promise<BudgetWithAnalytics[]> => {
    const params = new URLSearchParams()
    if (year != null) params.append('year', String(year))
    if (month != null) params.append('month', String(month))
    if (includeArchived) params.append('includeArchived', 'true')
    return apiClient.get<BudgetWithAnalytics[]>(`/budgets?${params.toString()}`)
  },

  getById: async (id: string): Promise<BudgetWithAnalytics> => {
    const res = await apiClient.get<{ budget: BudgetWithAnalytics }>(`/budgets/${id}`)
    return res.budget
  },

  create: async (data: BudgetCreateInput): Promise<BudgetWithAnalytics> => {
    const res = await apiClient.post<{ budget: BudgetWithAnalytics }>('/budgets', data)
    return res.budget
  },

  update: async (id: string, data: BudgetUpdateInput): Promise<BudgetWithAnalytics> => {
    const res = await apiClient.patch<{ budget: BudgetWithAnalytics }>(`/budgets/${id}`, data)
    return res.budget
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete<{ archived: boolean }>(`/budgets/${id}`)
  },
}
