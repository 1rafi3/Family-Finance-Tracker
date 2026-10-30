import mongoose from 'mongoose'
import { DEFAULT_CURRENCY, DEFAULT_LOAN_STATUS, LoanDirection, LoanStatus } from '@family-finance/shared'

export interface LoanDoc {
  ownerId: mongoose.Types.ObjectId
  direction: string
  counterpartyName: string
  principal: string
  interestRate?: number
  currency: string
  termMonths?: number
  dueDate?: Date
  remainingBalance: string
  status: string
  notes?: string
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const loanSchema = new mongoose.Schema<LoanDoc>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    direction: {
      type: String,
      enum: Object.values(LoanDirection),
      required: true,
    },
    counterpartyName: { type: String, required: true, trim: true, maxlength: 100 },
    principal: { type: String, required: true },
    interestRate: { type: Number, min: 0, max: 100, default: undefined },
    currency: { type: String, required: true, uppercase: true, trim: true, default: DEFAULT_CURRENCY },
    termMonths: { type: Number, min: 1, default: undefined },
    dueDate: { type: Date, default: undefined },
    remainingBalance: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      required: true,
      default: DEFAULT_LOAN_STATUS,
    },
    notes: { type: String, trim: true, maxlength: 500, default: undefined },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'loans',
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

loanSchema.index({ ownerId: 1, direction: 1, status: 1, isArchived: 1 })
loanSchema.index({ ownerId: 1, dueDate: 1 })

export const LoanModel = mongoose.model<LoanDoc>('Loan', loanSchema)
