import mongoose, { type HydratedDocument } from 'mongoose'
import type { CategoryType, Id } from '@family-finance/shared'
import {
  SubCategoryModel,
  SuperCategoryModel,
  type SubCategoryDoc,
  type SuperCategoryDoc,
} from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

export interface CreateSuperCategoryData {
  name: string
  type: CategoryType
  icon?: string
  color?: string
  description?: string
  isSystem?: boolean
  createdBy?: Id
}

export interface UpdateSuperCategoryData {
  name?: string
  icon?: string
  color?: string
  description?: string
  isArchived?: boolean
  updatedBy?: Id
}

export interface CreateSubCategoryData {
  superCategoryId: Id
  name: string
  type: CategoryType
  icon?: string
  color?: string
  description?: string
  createdBy?: Id
}

export interface UpdateSubCategoryData {
  name?: string
  superCategoryId?: Id
  icon?: string
  color?: string
  description?: string
  isArchived?: boolean
  updatedBy?: Id
}

function toObjectId(id?: Id): mongoose.Types.ObjectId | undefined {
  if (!id) return undefined
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
}

export class SuperCategoryRepository extends BaseRepository<SuperCategoryDoc> {
  constructor() {
    super(SuperCategoryModel)
  }

  listAll(type?: CategoryType, includeArchived = false): Promise<HydratedDocument<SuperCategoryDoc>[]> {
    const filter: Record<string, unknown> = {}
    if (type) filter.type = type
    if (!includeArchived) filter.isArchived = false
    return this.findMany(filter, { sort: { name: 1 } })
  }

  findByNameAndType(name: string, type: CategoryType): Promise<HydratedDocument<SuperCategoryDoc> | null> {
    return this.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, type })
  }

  createCategory(data: CreateSuperCategoryData): Promise<HydratedDocument<SuperCategoryDoc>> {
    return this.create({
      ...data,
      createdBy: toObjectId(data.createdBy) ?? null,
    })
  }
}

export class SubCategoryRepository extends BaseRepository<SubCategoryDoc> {
  constructor() {
    super(SubCategoryModel)
  }

  listAll(
    superCategoryId?: Id,
    type?: CategoryType,
    includeArchived = false,
  ): Promise<HydratedDocument<SubCategoryDoc>[]> {
    const filter: Record<string, unknown> = {}
    if (superCategoryId) {
      filter.superCategoryId = toObjectId(superCategoryId)
    }
    if (type) filter.type = type
    if (!includeArchived) filter.isArchived = false
    return this.findMany(filter, { sort: { name: 1 } })
  }

  findByNameAndParent(
    superCategoryId: Id,
    name: string,
  ): Promise<HydratedDocument<SubCategoryDoc> | null> {
    return this.findOne({
      superCategoryId: toObjectId(superCategoryId),
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })
  }

  createSubCategory(data: CreateSubCategoryData): Promise<HydratedDocument<SubCategoryDoc>> {
    return this.create({
      ...data,
      superCategoryId: toObjectId(data.superCategoryId)!,
      createdBy: toObjectId(data.createdBy) ?? null,
    })
  }
}
