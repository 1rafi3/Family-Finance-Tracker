import type { Document, FilterQuery, Model, UpdateQuery } from 'mongoose'
import { MAX_PAGE_LIMIT } from '@family-finance/shared'
import type { Id } from '@family-finance/shared'
import type { PaginatedResult } from '../types/pagination.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import type { SortDirection } from '../utils/pagination.js'

export interface FindManyOptions {
  sort?: Record<string, SortDirection>
  skip?: number
  limit?: number
}

export interface PaginateOptions {
  page: number
  limit: number
  sort?: Record<string, SortDirection>
}

export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}

  async findById(id: Id): Promise<T | null> {
    return this.model.findById(id).exec()
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec()
  }

  async findMany(filter: FilterQuery<T>, options: FindManyOptions = {}): Promise<T[]> {
    let query = this.model.find(filter)
    if (options.sort) {
      query = query.sort(options.sort)
    }
    if (options.skip !== undefined) {
      query = query.skip(options.skip)
    }
    if (options.limit !== undefined) {
      query = query.limit(options.limit)
    }
    return query.exec()
  }

  async create(data: Record<string, unknown>): Promise<T> {
    return this.model.create(data)
  }

  async updateById(id: Id, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec()
  }

  async deleteById(id: Id): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec()
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec()
  }

  async paginate(filter: FilterQuery<T>, options: PaginateOptions): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Math.floor(options.page))
    const limit = Math.min(Math.max(1, Math.floor(options.limit)), MAX_PAGE_LIMIT)
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(options.sort ?? {})
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ])
    return { items, ...buildPaginationMeta(total, page, limit) }
  }
}
