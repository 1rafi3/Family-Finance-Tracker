import type { HydratedDocument } from 'mongoose'
import type { Wallet } from '@family-finance/shared'
import type { WalletDoc } from '../models/wallet.js'

export function serializeWallet(wallet: HydratedDocument<WalletDoc>): Wallet {
  return {
    id: wallet.id,
    ownerId: wallet.ownerId.toString(),
    name: wallet.name,
    type: wallet.type,
    currency: wallet.currency,
    balance: wallet.balance,
    isArchived: wallet.isArchived,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
    createdBy: wallet.createdBy ? wallet.createdBy.toString() : undefined,
    updatedBy: wallet.updatedBy ? wallet.updatedBy.toString() : undefined,
  }
}
