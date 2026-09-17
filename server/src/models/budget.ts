import mongoose from 'mongoose'
import { BudgetPeriod, DEFAULT_CURRENCY, DEFAULT_BUDGET_PERIOD } from '@family-finance/shared'

export interface BudgetDoc {
  ownerId: mongoose.Types.ObjectId
  name?: string
  targetType: 'CATEGORY' | 'PERSON'
  superCategoryId?: mongoose.Types.ObjectId
  subCategoryId?: mongoose.Types.ObjectId
  personId?: mongoose.Types.ObjectId
  amount: string
  currency: string
  period: string
  periodYear: number
  periodMonth?: number
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const budgetSchema = new mongoose.Schema<BudgetDoc>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, maxlength: 100, default: undefined },
    targetType: { type: String, enum: ['CATEGORY', 'PERSON'], required: true, default: 'CATEGORY' },
    superCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperCategory',
      default: undefined,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      default: undefined,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: undefined,
    },
    amount: { type: String, required: true },
    currency: { type: String, required: true, uppercase: true, trim: true, default: DEFAULT_CURRENCY },
    period: {
      type: String,
      enum: Object.values(BudgetPeriod),
      required: true,
      default: DEFAULT_BUDGET_PERIOD,
    },
    periodYear: { type: Number, required: true },
    periodMonth: { type: Number, default: undefined },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'budgets',
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

budgetSchema.index({ ownerId: 1, periodYear: 1, periodMonth: 1, isArchived: 1 })
budgetSchema.index({ ownerId: 1, superCategoryId: 1, periodYear: 1, periodMonth: 1 })
budgetSchema.index({ ownerId: 1, personId: 1, periodYear: 1, periodMonth: 1 })

export const BudgetModel = mongoose.model<BudgetDoc>('Budget', budgetSchema)
