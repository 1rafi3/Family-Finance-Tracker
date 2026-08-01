import type { HydratedDocument } from 'mongoose'
import type { Id } from '@family-finance/shared'
import { UserModel, type UserDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

interface UpdateNameData {
  firstName?: string
  lastName?: string
}

export class UserRepository extends BaseRepository<UserDoc> {
  constructor() {
    super(UserModel)
  }

  listActiveUsers(): Promise<HydratedDocument<UserDoc>[]> {
    return this.findMany({ isActive: true }, { sort: { firstName: 1, lastName: 1 } })
  }

  updateName(id: Id, data: UpdateNameData): Promise<HydratedDocument<UserDoc> | null> {
    return this.updateById(id, data)
  }

  setActiveStatus(id: Id, isActive: boolean): Promise<HydratedDocument<UserDoc> | null> {
    return this.updateById(id, { isActive })
  }
}
