import type { Wallet, WalletUpdateInput } from '@family-finance/shared'
import { apiClient } from '@/lib/apiClient'

export interface ClientWalletCreateInput {
  name: string
  type?: string
  currency?: string
}

export async function fetchWallets(): Promise<Wallet[]> {
  return apiClient.get<Wallet[]>('/wallets')
}

export async function fetchWallet(id: string): Promise<Wallet> {
  const data = await apiClient.get<{ wallet: Wallet }>(`/wallets/${id}`)
  return data.wallet
}

export async function createWallet(input: ClientWalletCreateInput): Promise<Wallet> {
  const data = await apiClient.post<{ wallet: Wallet }>('/wallets', input)
  return data.wallet
}

export async function updateWallet(id: string, input: WalletUpdateInput): Promise<Wallet> {
  const data = await apiClient.patch<{ wallet: Wallet }>(`/wallets/${id}`, input)
  return data.wallet
}

export async function archiveWallet(id: string): Promise<Wallet> {
  const data = await apiClient.delete<{ wallet: Wallet }>(`/wallets/${id}`)
  return data.wallet
}
