import type { ClientSession, FilterQuery, HydratedDocument, UpdateQuery } from 'mongoose'
import mongoose from 'mongoose'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import type { Id } from '@family-finance/shared'
import { TransactionModel, type TransactionDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

/** Decoded cursor position: the last visible `date` + `_id`. */
export interface DecodedCursor {
  date: Date
  id: Id
}

export interface TransactionListFilter {
  ownerId?: Id
  type?: TransactionType
  status?: TransactionStatus
  walletId?: Id
  superCategoryId?: Id
  subCategoryId?: Id
  personId?: Id
  tagIds?: Id[]
  dateFrom?: Date
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
  search?: string
}

export interface TransactionListResult {
  items: HydratedDocument<TransactionDoc>[]
  total: number
  hasMore: boolean
  nextCursor: string | null
}

export function encodeCursor(cursor: DecodedCursor): string {
  return Buffer.from(JSON.stringify({ date: cursor.date.toISOString(), id: cursor.id })).toString(
    'base64',
  )
}

export function decodeCursor(cursor: string): DecodedCursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'))
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }
    const { date, id } = parsed as { date?: unknown; id?: unknown }
    if (typeof date !== 'string' || typeof id !== 'string') {
      return null
    }
    return { date: new Date(date), id }
  } catch {
    return null
  }
}

export class TransactionRepository extends BaseRepository<TransactionDoc> {
  constructor() {
    super(TransactionModel)
  }

  createWithSession(
    data: Partial<TransactionDoc>,
    session: ClientSession,
  ): Promise<HydratedDocument<TransactionDoc>> {
    return this.model.create([data], { session }).then((docs) => docs[0])
  }

  findByIdWithSession(
    id: Id,
    session: ClientSession,
  ): Promise<HydratedDocument<TransactionDoc> | null> {
    return this.model.findById(id).session(session).exec()
  }

  updateByIdWithSession(
    id: Id,
    update: UpdateQuery<TransactionDoc>,
    session: ClientSession,
  ): Promise<HydratedDocument<TransactionDoc> | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true, session })
      .exec()
  }

  /**
   * Cursor-paged list ordered by `date` descending then `_id` (API contract
   * §7.1). The optional cursor points to the last item of the previous page.
   */
  async listCursor(
    filter: TransactionListFilter,
    limit: number,
    cursor: DecodedCursor | null,
  ): Promise<TransactionListResult> {
    const baseFilter = this.buildFilter(filter)
    const conditions: FilterQuery<TransactionDoc>[] = [...baseFilter]

    if (cursor) {
      conditions.push({
        $or: [
          { date: { $lt: cursor.date } },
          { date: cursor.date, _id: { $lt: new mongoose.Types.ObjectId(cursor.id) } },
        ],
      })
    }

    const queryFilter = toFilterQuery(conditions)
    const countFilter = toFilterQuery(baseFilter)

    const query = this.model.find(queryFilter)
    const fetched = await query
      .sort({ date: -1, _id: -1 })
      .limit(limit + 1)
      .exec()
    const hasMore = fetched.length > limit
    const items = hasMore ? fetched.slice(0, limit) : fetched

    const total = await this.model.countDocuments(countFilter).exec()
    const last = items[items.length - 1]
    const nextCursor = hasMore && last ? encodeCursor({ date: last.date, id: last.id }) : null

    return { items, total, hasMore, nextCursor }
  }

  private buildFilter(filter: TransactionListFilter): FilterQuery<TransactionDoc>[] {
    const conditions: FilterQuery<TransactionDoc>[] = []

    if (filter.ownerId) {
      conditions.push({ ownerId: filter.ownerId })
    }
    if (filter.type) {
      conditions.push({ type: filter.type })
    }
    if (filter.status) {
      conditions.push({ status: filter.status })
    }
    if (filter.walletId) {
      conditions.push({
        $or: [
          { walletId: filter.walletId },
          { sourceWalletId: filter.walletId },
          { destinationWalletId: filter.walletId },
        ],
      })
    }
    if (filter.superCategoryId) {
      conditions.push({ superCategoryId: filter.superCategoryId })
    }
    if (filter.subCategoryId) {
      conditions.push({ subCategoryId: filter.subCategoryId })
    }
    if (filter.personId) {
      conditions.push({ personId: new mongoose.Types.ObjectId(filter.personId) })
    }
    if (filter.tagIds && filter.tagIds.length > 0) {
      conditions.push({ tagIds: { $in: filter.tagIds } })
    }

    const dateConditions: FilterQuery<TransactionDoc>[] = []
    if (filter.dateFrom) {
      dateConditions.push({ date: { $gte: filter.dateFrom } })
    }
    if (filter.dateTo) {
      dateConditions.push({ date: { $lte: filter.dateTo } })
    }
    if (dateConditions.length > 0) {
      conditions.push({ $and: dateConditions })
    }

    if (filter.amountFrom !== undefined || filter.amountTo !== undefined) {
      const amountConditions: Record<string, unknown>[] = []
      if (filter.amountFrom !== undefined) {
        amountConditions.push({ $gte: [{ $toDouble: '$amount' }, filter.amountFrom] })
      }
      if (filter.amountTo !== undefined) {
        amountConditions.push({ $lte: [{ $toDouble: '$amount' }, filter.amountTo] })
      }
      conditions.push({ $expr: { $and: amountConditions } })
    }

    if (filter.search) {
      conditions.push({ notes: { $regex: escapeRegex(filter.search), $options: 'i' } })
    }

    return conditions
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toFilterQuery(conditions: FilterQuery<TransactionDoc>[]): FilterQuery<TransactionDoc> {
  if (conditions.length === 0) return {}
  if (conditions.length === 1) return conditions[0]
  return { $and: conditions }
}

