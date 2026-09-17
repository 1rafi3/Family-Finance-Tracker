import { Banknote, Building2, Home, Smartphone, Wallet, type LucideIcon } from 'lucide-react'
import { WALLET_TYPES } from '@family-finance/shared'

export interface WalletTypeConfig {
  label: string
  icon: LucideIcon
  color: string
}

export const WALLET_TYPE_CONFIG: Record<string, WalletTypeConfig> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-success' },
  bank: { label: 'Bank', icon: Building2, color: 'text-primary' },
  bkash: { label: 'bKash', icon: Smartphone, color: 'text-pink-500' },
  nagad: { label: 'Nagad', icon: Smartphone, color: 'text-orange-500' },
  rocket: { label: 'Rocket', icon: Smartphone, color: 'text-purple-500' },
  houseCash: { label: 'House Cash', icon: Home, color: 'text-amber-500' },
}

export const DEFAULT_WALLET_CONFIG: WalletTypeConfig = {
  label: 'Wallet',
  icon: Wallet,
  color: 'text-muted-foreground',
}

export function getWalletTypeConfig(type: string): WalletTypeConfig {
  return WALLET_TYPE_CONFIG[type] ?? { ...DEFAULT_WALLET_CONFIG, label: type }
}

// Ordered list for select options
export const WALLET_TYPE_OPTIONS = WALLET_TYPES.map((t) => ({
  value: t,
  label: WALLET_TYPE_CONFIG[t]?.label ?? t,
}))

export function formatBalance(balance: string, currency: string): string {
  const amount = parseFloat(balance)
  try {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${balance}`
  }
}
