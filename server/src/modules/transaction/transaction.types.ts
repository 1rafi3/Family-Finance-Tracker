import mongoose from 'mongoose'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import type { Money } from '@family-finance/shared'

/** Data required to persist a new transaction. */
export interface TransactionCreateData {
  type: TransactionType
  status: TransactionStatus
  amount: Money
  currency: string
  walletId?: mongoose.Types.ObjectId
  sourceWalletId?: mongoose.Types.ObjectId
  destinationWalletId?: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId
  subCategoryId?: mongoose.Types.ObjectId
  superCategoryId?: mongoose.Types.ObjectId
  personId?: mongoose.Types.ObjectId
  tagIds: mongoose.Types.ObjectId[]
  notes?: string
  date: Date
  createdBy: mongoose.Types.ObjectId
}

/** A transaction state used to merge an existing record with update input. */
export interface TransactionDraft {
  type: TransactionType
  status: TransactionStatus
  amount: Money
  currency: string
  walletId?: mongoose.Types.ObjectId
  sourceWalletId?: mongoose.Types.ObjectId
  destinationWalletId?: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId
  subCategoryId?: mongoose.Types.ObjectId
  superCategoryId?: mongoose.Types.ObjectId
  personId?: mongoose.Types.ObjectId
  tagIds: mongoose.Types.ObjectId[]
  notes?: string
  date: Date
}

/** A single wallet balance movement implied by a COMPLETED transaction. */
export interface BalanceAdjustment {
  walletId: string
  amount: Money
  direction: 1 | -1
}
