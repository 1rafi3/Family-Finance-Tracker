import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Wallet, WalletUpdateInput } from '@family-finance/shared'
import { useToast } from '@/components/ui/toast'
import {
  archiveWallet,
  createWallet,
  fetchWallet,
  fetchWallets,
  updateWallet,
  type ClientWalletCreateInput,
} from './wallet.service'

// ── Query keys ───────────────────────────────────────────────────────────────
export const walletKeys = {
  all: ['wallets'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  detail: (id: string) => [...walletKeys.all, 'detail', id] as const,
}

// ── useWallets ───────────────────────────────────────────────────────────────
export function useWallets() {
  return useQuery({
    queryKey: walletKeys.lists(),
    queryFn: fetchWallets,
  })
}

// ── useWallet ────────────────────────────────────────────────────────────────
export function useWallet(id: string) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => fetchWallet(id),
    enabled: Boolean(id),
  })
}

// ── useCreateWallet ──────────────────────────────────────────────────────────
export function useCreateWallet() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (input: ClientWalletCreateInput) => createWallet(input),
    onSuccess: (wallet) => {
      // Append to list cache immediately (optimistic insert)
      queryClient.setQueryData<Wallet[]>(walletKeys.lists(), (old) =>
        old ? [...old, wallet] : [wallet],
      )
      // Also invalidate to refetch authoritative order from server
      void queryClient.invalidateQueries({ queryKey: walletKeys.lists() })
      toast(`"${wallet.name}" wallet created`, 'success')
    },
    onError: () => {
      toast('Failed to create wallet. Please try again.', 'error')
    },
  })
}

// ── useUpdateWallet ──────────────────────────────────────────────────────────
export function useUpdateWallet() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: WalletUpdateInput }) =>
      updateWallet(id, input),
    onSuccess: (wallet) => {
      // Update both list and detail caches
      queryClient.setQueryData<Wallet[]>(walletKeys.lists(), (old) =>
        old ? old.map((w) => (w.id === wallet.id ? wallet : w)) : [wallet],
      )
      queryClient.setQueryData(walletKeys.detail(wallet.id), wallet)
      toast(`"${wallet.name}" updated`, 'success')
    },
    onError: () => {
      toast('Failed to update wallet. Please try again.', 'error')
    },
  })
}

// ── useArchiveWallet ─────────────────────────────────────────────────────────
export function useArchiveWallet() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => archiveWallet(id),
    onSuccess: (wallet) => {
      // Remove from active list cache immediately
      queryClient.setQueryData<Wallet[]>(walletKeys.lists(), (old) =>
        old ? old.filter((w) => w.id !== wallet.id) : [],
      )
      // Invalidate to stay in sync
      void queryClient.invalidateQueries({ queryKey: walletKeys.lists() })
      toast(`"${wallet.name}" archived`, 'info')
    },
    onError: () => {
      toast('Failed to archive wallet. Please try again.', 'error')
    },
  })
}
