import type { HydratedDocument } from 'mongoose'
import type { Id, UserRole } from '@family-finance/shared'
import { UserModel, type UserDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
  role: UserRole
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

  countAdmins(): Promise<number> {
    return this.count({ role: 'ADMIN' })
  }

  createUser(data: CreateUserData): Promise<HydratedDocument<UserDoc>> {
    return this.create(data)
  }

  updatePassword(id: Id, passwordHash: string): Promise<HydratedDocument<UserDoc> | null> {
    return this.updateById(id, { passwordHash })
  }

  async updateLastLoginAt(id: Id): Promise<void> {
    await this.updateById(id, { lastLoginAt: new Date() })
  }
}

export const authRepository = new AuthRepository()
