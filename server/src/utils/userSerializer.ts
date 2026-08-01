import type { HydratedDocument } from 'mongoose'
import type { User } from '@family-finance/shared'
import type { UserDoc } from '../models/user.js'

export function serializeUser(user: HydratedDocument<UserDoc>): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    createdBy: user.createdBy ? user.createdBy.toString() : undefined,
    updatedBy: user.updatedBy ? user.updatedBy.toString() : undefined,
  }
}
