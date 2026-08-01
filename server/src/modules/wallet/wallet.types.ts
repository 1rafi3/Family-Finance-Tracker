import mongoose from 'mongoose'
import type { Money } from '@family-finance/shared'

/** Data required to persist a new wallet. The owner is always the acting user. */
export interface WalletCreateData {
  ownerId: mongoose.Types.ObjectId
  name: string
  type: string
  currency: string
  balance: Money
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy: mongoose.Types.ObjectId
}
