import type { Transaction, TransactionStatus, TransactionType } from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export interface CursorPaginationMeta {
  limit: number
  total: number
  hasMore: boolean
  nextCursor: string | null
}

export interface TransactionListQuery {
  cursor?: string
  limit?: number
  type?: string
  status?: string
  walletId?: string
  personId?: string
  dateFrom?: string
  dateTo?: string
  amountFrom?: string
  amountTo?: string
  search?: string
}

export interface PaginatedTransactions {
  data: Transaction[]
  pagination: CursorPaginationMeta
}

export interface ClientTransactionCreateInput {
  type: TransactionType
  status?: TransactionStatus
  amount: string
  currency?: string
  walletId?: string
  sourceWalletId?: string
  destinationWalletId?: string
  ownerId?: string
  personId?: string
  subCategoryId?: string
  tagIds?: string[]
  notes?: string
  date: string
}

export interface ClientTransactionUpdateInput {
  type?: TransactionType
  status?: TransactionStatus
  amount?: string
  currency?: string
  walletId?: string
  sourceWalletId?: string
  destinationWalletId?: string
  ownerId?: string
  personId?: string
  subCategoryId?: string
  tagIds?: string[]
  notes?: string
  date?: string
}

export async function fetchTransactions(
  query: TransactionListQuery = {},
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams()
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.limit) params.set('limit', String(query.limit))
  if (query.type) params.set('type', query.type)
  if (query.status) params.set('status', query.status)
  if (query.walletId) params.set('walletId', query.walletId)
  if (query.personId) params.set('personId', query.personId)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  if (query.amountFrom) params.set('amountFrom', query.amountFrom)
  if (query.amountTo) params.set('amountTo', query.amountTo)
  if (query.search) params.set('search', query.search)

  const queryString = params.toString()
  const path = `/transactions${queryString ? `?${queryString}` : ''}`
  return apiClient.get<PaginatedTransactions>(path)
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const res = await apiClient.get<{ transaction: Transaction }>(`/transactions/${id}`)
  return res.transaction
}

export async function createTransaction(input: ClientTransactionCreateInput): Promise<Transaction> {
  const res = await apiClient.post<{ transaction: Transaction }>('/transactions', input)
  return res.transaction
}

export async function updateTransaction(
  id: string,
  input: ClientTransactionUpdateInput,
): Promise<Transaction> {
  const res = await apiClient.patch<{ transaction: Transaction }>(`/transactions/${id}`, input)
  return res.transaction
}

export async function voidTransaction(id: string): Promise<Transaction> {
  const res = await apiClient.delete<{ transaction: Transaction }>(`/transactions/${id}`)
  return res.transaction
}
