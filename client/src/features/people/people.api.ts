import type { CreatePersonInput, Person, UpdatePersonInput } from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export interface PersonWithStats extends Person {
  totalSpent: number
  transactionCount: number
}

export const peopleApi = {
  list: async (isArchived = false): Promise<PersonWithStats[]> => {
    const params = new URLSearchParams()
    if (isArchived) params.append('isArchived', 'true')
    return apiClient.get<PersonWithStats[]>(`/people?${params.toString()}`)
  },

  getById: async (id: string): Promise<PersonWithStats> => {
    const res = await apiClient.get<{ person: PersonWithStats }>(`/people/${id}`)
    return res.person
  },

  create: async (data: CreatePersonInput): Promise<PersonWithStats> => {
    const res = await apiClient.post<{ person: PersonWithStats }>('/people', data)
    return res.person
  },

  update: async (id: string, data: UpdatePersonInput): Promise<PersonWithStats> => {
    const res = await apiClient.patch<{ person: PersonWithStats }>(`/people/${id}`, data)
    return res.person
  },

  archive: async (id: string): Promise<PersonWithStats> => {
    const res = await apiClient.delete<{ person: PersonWithStats }>(`/people/${id}`)
    return res.person
  },
}
