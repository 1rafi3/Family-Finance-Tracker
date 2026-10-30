import type {
  SavingsGoal,
  SavingsGoalCreateInput,
  SavingsGoalUpdateInput,
} from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export const savingsGoalApi = {
  list: async (includeArchived = false): Promise<SavingsGoal[]> => {
    const params = new URLSearchParams()
    if (includeArchived) params.append('includeArchived', 'true')
    return apiClient.get<SavingsGoal[]>(`/savings-goals?${params.toString()}`)
  },

  getById: async (id: string): Promise<SavingsGoal> => {
    const res = await apiClient.get<{ goal: SavingsGoal }>(`/savings-goals/${id}`)
    return res.goal
  },

  create: async (data: SavingsGoalCreateInput): Promise<SavingsGoal> => {
    const res = await apiClient.post<{ goal: SavingsGoal }>('/savings-goals', data)
    return res.goal
  },

  update: async (id: string, data: SavingsGoalUpdateInput): Promise<SavingsGoal> => {
    const res = await apiClient.patch<{ goal: SavingsGoal }>(`/savings-goals/${id}`, data)
    return res.goal
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete<{ archived: boolean }>(`/savings-goals/${id}`)
  },

  deposit: async (
    id: string,
    addAmount: number,
    currentSaved: number,
    targetAmount: number,
  ): Promise<SavingsGoal> => {
    const newTotal = (currentSaved + addAmount).toFixed(2)
    const isCompleted = Number(newTotal) >= targetAmount
    const updatePayload: SavingsGoalUpdateInput = {
      currentAmount: newTotal,
      ...(isCompleted ? { status: 'COMPLETED' } : {}),
    }
    const res = await apiClient.patch<{ goal: SavingsGoal }>(`/savings-goals/${id}`, updatePayload)
    return res.goal
  },
}
