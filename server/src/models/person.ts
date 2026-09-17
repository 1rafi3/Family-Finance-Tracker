import mongoose from 'mongoose'

export interface PersonDoc {
  ownerId: mongoose.Types.ObjectId
  name: string
  relationship: string
  color?: string
  avatar?: string
  notes?: string
  isArchived: boolean
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const personSchema = new mongoose.Schema<PersonDoc>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    relationship: { type: String, required: true, trim: true, maxlength: 50 },
    color: { type: String, trim: true, default: '#3b82f6' },
    avatar: { type: String, trim: true, default: undefined },
    notes: { type: String, trim: true, maxlength: 300, default: undefined },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'people',
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

personSchema.index({ ownerId: 1, isArchived: 1 })
personSchema.index({ ownerId: 1, name: 1 }, { unique: true })

export const PersonModel = mongoose.model<PersonDoc>('Person', personSchema)
