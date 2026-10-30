import type { Loan, LoanCreateInput, LoanUpdateInput } from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export const loanApi = {
  list: async (includeArchived = false): Promise<Loan[]> => {
    const params = new URLSearchParams()
    if (includeArchived) params.append('includeArchived', 'true')
    return apiClient.get<Loan[]>(`/loans?${params.toString()}`)
  },

  getById: async (id: string): Promise<Loan> => {
    const res = await apiClient.get<{ loan: Loan }>(`/loans/${id}`)
    return res.loan
  },

  create: async (data: LoanCreateInput): Promise<Loan> => {
    const res = await apiClient.post<{ loan: Loan }>('/loans', data)
    return res.loan
  },

  update: async (id: string, data: LoanUpdateInput): Promise<Loan> => {
    const res = await apiClient.patch<{ loan: Loan }>(`/loans/${id}`, data)
    return res.loan
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete<{ archived: boolean }>(`/loans/${id}`)
  },

  recordRepayment: async (
    id: string,
    repaymentAmount: number,
    currentBalance: number,
  ): Promise<Loan> => {
    const newBalance = Math.max(0, currentBalance - repaymentAmount).toFixed(2)
    const isPaid = Number(newBalance) <= 0
    const updatePayload: LoanUpdateInput = {
      remainingBalance: newBalance,
      ...(isPaid ? { status: 'PAID' } : {}),
    }
    const res = await apiClient.patch<{ loan: Loan }>(`/loans/${id}`, updatePayload)
    return res.loan
  },
}
