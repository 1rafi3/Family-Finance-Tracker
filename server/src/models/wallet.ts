import mongoose from 'mongoose'
import { DEFAULT_CURRENCY, DEFAULT_WALLET_TYPE, ZERO_MONEY } from '@family-finance/shared'
import type { Money } from '@family-finance/shared'

export interface WalletDoc {
  ownerId: mongoose.Types.ObjectId
  name: string
  type: string
  currency: string
  balance: Money
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId | null
  updatedBy: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const walletSchema = new mongoose.Schema<WalletDoc>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    type: { type: String, required: true, trim: true, maxlength: 50, default: DEFAULT_WALLET_TYPE },
    currency: { type: String, required: true, uppercase: true, trim: true, default: DEFAULT_CURRENCY },
    balance: { type: String, required: true, default: ZERO_MONEY },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'wallets',
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

walletSchema.index({ ownerId: 1, isArchived: 1 })

export const WalletModel = mongoose.model<WalletDoc>('Wallet', walletSchema)
