import mongoose from 'mongoose'
import { UserRole } from '@family-finance/shared'

export interface UserDoc {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  role: UserRole
  isActive: boolean
  lastLoginAt: Date | null
  createdBy: mongoose.Types.ObjectId | null
  updatedBy: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER, required: true },
    isActive: { type: Boolean, default: true, required: true },
    lastLoginAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    collection: 'users',
    collation: { locale: 'en', strength: 2 },
    toJSON: {
      versionKey: false,
      transform: (_doc: mongoose.Document, ret: Record<string, unknown>) => {
        const id = String(ret._id)
        delete ret._id
        delete ret.passwordHash
        return { id, ...ret }
      },
    },
  },
)

export const UserModel = mongoose.model<UserDoc>('User', userSchema)
