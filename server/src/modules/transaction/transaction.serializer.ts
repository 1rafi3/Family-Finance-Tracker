import type { HydratedDocument } from 'mongoose'
import type { Transaction } from '@family-finance/shared'
import type { TransactionDoc } from '../../models/transaction.js'

export function serializeTransaction(transaction: HydratedDocument<TransactionDoc>): Transaction {
  return {
    id: transaction.id,
    type: transaction.type,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    walletId: transaction.walletId ? transaction.walletId.toString() : undefined,
    sourceWalletId: transaction.sourceWalletId ? transaction.sourceWalletId.toString() : undefined,
    destinationWalletId: transaction.destinationWalletId
      ? transaction.destinationWalletId.toString()
      : undefined,
    ownerId: transaction.ownerId.toString(),
    subCategoryId: transaction.subCategoryId ? transaction.subCategoryId.toString() : undefined,
    superCategoryId: transaction.superCategoryId
      ? transaction.superCategoryId.toString()
      : undefined,
    personId: transaction.personId ? transaction.personId.toString() : undefined,
    tagIds: transaction.tagIds.map(String),
    notes: transaction.notes,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    createdBy: transaction.createdBy.toString(),
  }
}
