import type { HydratedDocument } from 'mongoose'
import type { Id } from '@family-finance/shared'
import { UserModel, type UserDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
}

export class AuthRepository extends BaseRepository<UserDoc> {
  constructor() {
    super(UserModel)
  }

  findByEmail(email: string): Promise<HydratedDocument<UserDoc> | null> {
    return this.findOne({ email })
  }

  findActiveById(id: Id): Promise<HydratedDocument<UserDoc> | null> {
    return this.findOne({ _id: id, isActive: true })
  }

  createUser(data: CreateUserData): Promise<HydratedDocument<UserDoc>> {
    return this.create(data)
  }

  async updateLastLoginAt(id: Id): Promise<void> {
    await this.updateById(id, { lastLoginAt: new Date() })
  }
}

export const authRepository = new AuthRepository()
