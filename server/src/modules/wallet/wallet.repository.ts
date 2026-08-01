import type { HydratedDocument } from 'mongoose'
import type { Id } from '@family-finance/shared'
import { WalletModel, type WalletDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

interface UpdateWalletData {
  name?: string
  type?: string
  currency?: string
}

export class WalletRepository extends BaseRepository<WalletDoc> {
  constructor() {
    super(WalletModel)
  }

  listOwn(ownerId: Id): Promise<HydratedDocument<WalletDoc>[]> {
    return this.findMany({ ownerId, isArchived: false }, { sort: { name: 1 } })
  }

  updateDetails(id: Id, data: UpdateWalletData): Promise<HydratedDocument<WalletDoc> | null> {
    return this.updateById(id, data)
  }

  archive(id: Id): Promise<HydratedDocument<WalletDoc> | null> {
    return this.updateById(id, { isArchived: true })
  }
}
