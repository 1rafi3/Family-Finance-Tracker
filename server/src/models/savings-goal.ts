import mongoose from 'mongoose'
import { DEFAULT_CURRENCY, DEFAULT_SAVINGS_GOAL_STATUS, SavingsGoalStatus } from '@family-finance/shared'

export interface SavingsGoalDoc {
  ownerId: mongoose.Types.ObjectId
  name: string
  targetAmount: string
  currentAmount: string
  currency: string
  deadline?: Date
  status: string
  notes?: string
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const savingsGoalSchema = new mongoose.Schema<SavingsGoalDoc>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    targetAmount: { type: String, required: true },
    currentAmount: { type: String, required: true, default: '0.00' },
    currency: { type: String, required: true, uppercase: true, trim: true, default: DEFAULT_CURRENCY },
    deadline: { type: Date, default: undefined },
    status: {
      type: String,
      enum: Object.values(SavingsGoalStatus),
      required: true,
      default: DEFAULT_SAVINGS_GOAL_STATUS,
    },
    notes: { type: String, trim: true, maxlength: 500, default: undefined },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'savings_goals',
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

savingsGoalSchema.index({ ownerId: 1, status: 1, isArchived: 1 })
savingsGoalSchema.index({ ownerId: 1, deadline: 1 })

export const SavingsGoalModel = mongoose.model<SavingsGoalDoc>('SavingsGoal', savingsGoalSchema)
