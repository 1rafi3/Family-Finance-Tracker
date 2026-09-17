import mongoose from 'mongoose'
import { CategoryType } from '@family-finance/shared'

export interface SuperCategoryDoc {
  name: string
  type: CategoryType
  icon?: string
  color?: string
  description?: string
  isSystem: boolean
  isArchived: boolean
  createdBy?: mongoose.Types.ObjectId | null
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const superCategorySchema = new mongoose.Schema<SuperCategoryDoc>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    type: { type: String, enum: Object.values(CategoryType), required: true },
    icon: { type: String, trim: true, default: 'folder' },
    color: { type: String, trim: true, default: '#64748b' },
    description: { type: String, trim: true, maxlength: 200, default: undefined },
    isSystem: { type: Boolean, required: true, default: false },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'super_categories',
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

superCategorySchema.index({ type: 1, isArchived: 1 })
superCategorySchema.index({ name: 1, type: 1 }, { unique: true })

export const SuperCategoryModel = mongoose.model<SuperCategoryDoc>(
  'SuperCategory',
  superCategorySchema,
)

export interface SubCategoryDoc {
  superCategoryId: mongoose.Types.ObjectId
  name: string
  type: CategoryType
  icon?: string
  color?: string
  description?: string
  isArchived: boolean
  createdBy?: mongoose.Types.ObjectId | null
  updatedBy?: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const subCategorySchema = new mongoose.Schema<SubCategoryDoc>(
  {
    superCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperCategory',
      required: true,
    },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    type: { type: String, enum: Object.values(CategoryType), required: true },
    icon: { type: String, trim: true, default: 'tag' },
    color: { type: String, trim: true, default: '#64748b' },
    description: { type: String, trim: true, maxlength: 200, default: undefined },
    isArchived: { type: Boolean, required: true, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'sub_categories',
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

subCategorySchema.index({ superCategoryId: 1, isArchived: 1 })
subCategorySchema.index({ superCategoryId: 1, name: 1 }, { unique: true })

export const SubCategoryModel = mongoose.model<SubCategoryDoc>('SubCategory', subCategorySchema)
