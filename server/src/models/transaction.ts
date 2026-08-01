import mongoose from 'mongoose'
import { TransactionStatus, TransactionType, ZERO_MONEY } from '@family-finance/shared'
import type { Money } from '@family-finance/shared'

export interface TransactionDoc {
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
  tagIds: mongoose.Types.ObjectId[]
  notes?: string
  date: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new mongoose.Schema<TransactionDoc>(
  {
    type: { type: String, enum: Object.values(TransactionType), required: true },
    status: { type: String, enum: Object.values(TransactionStatus), required: true, default: TransactionStatus.COMPLETED },
    amount: { type: String, required: true, default: ZERO_MONEY },
    currency: { type: String, required: true, uppercase: true, trim: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: undefined },
    sourceWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: undefined },
    destinationWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: undefined },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', default: undefined },
    superCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperCategory', default: undefined },
    tagIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Tag', default: [] },
    notes: { type: String, trim: true, maxlength: 500, default: undefined },
    date: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    collection: 'transactions',
    toJSON: {
      versionKey: false,
      transform: (_doc: mongoose.Document, ret: Record<string, unknown>) => {
        const id = String(ret._id)
        delete ret._id
        return { id, ...ret }
      },
    },
  },
)

transactionSchema.index({ ownerId: 1, date: -1 })
transactionSchema.index({ walletId: 1, date: -1 })
transactionSchema.index({ sourceWalletId: 1 })
transactionSchema.index({ destinationWalletId: 1 })
transactionSchema.index({ superCategoryId: 1, date: -1 })
transactionSchema.index({ subCategoryId: 1 })
transactionSchema.index({ tagIds: 1, date: -1 })
transactionSchema.index({ type: 1, date: -1 })
transactionSchema.index({ date: -1 })

export const TransactionModel = mongoose.model<TransactionDoc>('Transaction', transactionSchema)
