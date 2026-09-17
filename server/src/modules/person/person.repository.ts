import mongoose, { type HydratedDocument } from 'mongoose'
import type { Id } from '@family-finance/shared'
import { PersonModel, TransactionModel, type PersonDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

export interface CreatePersonData {
  ownerId: Id
  name: string
  relationship: string
  color?: string
  avatar?: string
  notes?: string
  createdBy: Id
}

export interface UpdatePersonData {
  name?: string
  relationship?: string
  color?: string
  avatar?: string
  notes?: string
  isArchived?: boolean
  updatedBy?: Id
}

function toObjectId(id: Id): mongoose.Types.ObjectId {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
}

export class PersonRepository extends BaseRepository<PersonDoc> {
  constructor() {
    super(PersonModel)
  }

  listByOwner(ownerId: Id, includeArchived = false): Promise<HydratedDocument<PersonDoc>[]> {
    const filter: Record<string, unknown> = { ownerId: toObjectId(ownerId) }
    if (!includeArchived) {
      filter.isArchived = false
    }
    return this.findMany(filter, { sort: { name: 1 } })
  }

  findByIdAndOwner(id: Id, ownerId: Id): Promise<HydratedDocument<PersonDoc> | null> {
    return this.findOne({ _id: toObjectId(id), ownerId: toObjectId(ownerId) })
  }

  findByNameAndOwner(ownerId: Id, name: string): Promise<HydratedDocument<PersonDoc> | null> {
    return this.findOne({
      ownerId: toObjectId(ownerId),
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })
  }

  createPerson(data: CreatePersonData): Promise<HydratedDocument<PersonDoc>> {
    return this.create({
      ...data,
      ownerId: toObjectId(data.ownerId),
      createdBy: toObjectId(data.createdBy),
      isArchived: false,
    })
  }

  updatePerson(id: Id, ownerId: Id, data: UpdatePersonData): Promise<HydratedDocument<PersonDoc> | null> {
    const updatePayload: Record<string, unknown> = { ...data }
    if (data.updatedBy) {
      updatePayload.updatedBy = toObjectId(data.updatedBy)
    }
    return this.model
      .findOneAndUpdate({ _id: toObjectId(id), ownerId: toObjectId(ownerId) }, updatePayload, {
        new: true,
      })
      .exec()
  }

  archivePerson(id: Id, ownerId: Id): Promise<HydratedDocument<PersonDoc> | null> {
    return this.model
      .findOneAndUpdate(
        { _id: toObjectId(id), ownerId: toObjectId(ownerId) },
        { isArchived: true },
        { new: true },
      )
      .exec()
  }

  /**
   * Aggregates total spent per person for the owner.
   */
  async getSpendingSummary(ownerId: Id): Promise<Array<{ personId: string; totalSpent: number; txCount: number }>> {
    const results = await TransactionModel.aggregate([
      {
        $match: {
          ownerId: toObjectId(ownerId),
          type: 'EXPENSE',
          status: 'COMPLETED',
          personId: { $ne: null, $exists: true },
        },
      },
      {
        $group: {
          _id: '$personId',
          totalSpent: { $sum: { $toDouble: '$amount' } },
          txCount: { $sum: 1 },
        },
      },
    ])

    return results.map((r) => ({
      personId: String(r._id),
      totalSpent: r.totalSpent,
      txCount: r.txCount,
    }))
  }
}
