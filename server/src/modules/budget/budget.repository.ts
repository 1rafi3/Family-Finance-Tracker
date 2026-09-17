import mongoose, { type HydratedDocument } from 'mongoose'
import type { Id, BudgetWithAnalytics, BudgetStatus } from '@family-finance/shared'
import { BudgetModel, SubCategoryModel, TransactionModel, type BudgetDoc } from '../../models/index.js'
import { BaseRepository } from '../../repositories/index.js'

export interface CreateBudgetData {
  ownerId: Id
  name?: string
  targetType: 'CATEGORY' | 'PERSON'
  superCategoryId?: Id
  subCategoryId?: Id
  personId?: Id
  amount: string
  currency?: string
  period?: string
  periodYear: number
  periodMonth?: number
  createdBy: Id
}

export interface UpdateBudgetData {
  name?: string
  amount?: string
  superCategoryId?: Id
  subCategoryId?: Id
  personId?: Id
  targetType?: 'CATEGORY' | 'PERSON'
  periodYear?: number
  periodMonth?: number
  isArchived?: boolean
  updatedBy?: Id
}

function toObjectId(id: Id): mongoose.Types.ObjectId {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
}

export class BudgetRepository extends BaseRepository<BudgetDoc> {
  constructor() {
    super(BudgetModel)
  }

  async listByOwner(
    ownerId: Id,
    year?: number,
    month?: number,
    includeArchived = false,
  ): Promise<HydratedDocument<BudgetDoc>[]> {
    const filter: Record<string, unknown> = { ownerId: toObjectId(ownerId) }
    if (!includeArchived) {
      filter.isArchived = false
    }
    if (year != null) {
      filter.periodYear = year
    }
    if (month != null) {
      filter.periodMonth = month
    }
    return this.findMany(filter, { sort: { targetType: 1, createdAt: -1 } })
  }

  findByIdAndOwner(id: Id, ownerId: Id): Promise<HydratedDocument<BudgetDoc> | null> {
    return this.findOne({ _id: toObjectId(id), ownerId: toObjectId(ownerId) })
  }

  async createBudget(data: CreateBudgetData): Promise<HydratedDocument<BudgetDoc>> {
    return this.create({
      ownerId: toObjectId(data.ownerId),
      name: data.name,
      targetType: data.targetType,
      superCategoryId: data.superCategoryId ? toObjectId(data.superCategoryId) : undefined,
      subCategoryId: data.subCategoryId ? toObjectId(data.subCategoryId) : undefined,
      personId: data.personId ? toObjectId(data.personId) : undefined,
      amount: data.amount,
      currency: data.currency || 'BDT',
      period: data.period || 'MONTHLY',
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      isArchived: false,
      createdBy: toObjectId(data.createdBy),
    })
  }

  async updateBudget(
    id: Id,
    ownerId: Id,
    data: UpdateBudgetData,
  ): Promise<HydratedDocument<BudgetDoc> | null> {
    const updatePayload: Record<string, unknown> = {}
    if (data.name !== undefined) updatePayload.name = data.name
    if (data.amount !== undefined) updatePayload.amount = data.amount
    if (data.targetType !== undefined) updatePayload.targetType = data.targetType
    if (data.periodYear !== undefined) updatePayload.periodYear = data.periodYear
    if (data.periodMonth !== undefined) updatePayload.periodMonth = data.periodMonth
    if (data.isArchived !== undefined) updatePayload.isArchived = data.isArchived

    if (data.superCategoryId !== undefined) {
      updatePayload.superCategoryId = data.superCategoryId ? toObjectId(data.superCategoryId) : null
    }
    if (data.subCategoryId !== undefined) {
      updatePayload.subCategoryId = data.subCategoryId ? toObjectId(data.subCategoryId) : null
    }
    if (data.personId !== undefined) {
      updatePayload.personId = data.personId ? toObjectId(data.personId) : null
    }
    if (data.updatedBy) {
      updatePayload.updatedBy = toObjectId(data.updatedBy)
    }

    return this.model
      .findOneAndUpdate({ _id: toObjectId(id), ownerId: toObjectId(ownerId) }, updatePayload, {
        new: true,
      })
      .exec()
  }

  async archiveBudget(id: Id, ownerId: Id): Promise<HydratedDocument<BudgetDoc> | null> {
    return this.model
      .findOneAndUpdate(
        { _id: toObjectId(id), ownerId: toObjectId(ownerId) },
        { isArchived: true },
        { new: true },
      )
      .exec()
  }

  /**
   * Enriches budgets with actual spending data aggregated from transactions in that period.
   */
  async attachAnalytics(
    ownerId: Id,
    budgets: HydratedDocument<BudgetDoc>[],
    year: number,
    month: number,
  ): Promise<BudgetWithAnalytics[]> {
    if (budgets.length === 0) {
      return []
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

    // Fetch all completed expense transactions for this period
    const transactions = await TransactionModel.find({
      ownerId: toObjectId(ownerId),
      type: 'EXPENSE',
      status: 'COMPLETED',
      date: { $gte: startDate, $lte: endDate },
    }).exec()

    // Map subcategories to their parent supercategory for accurate roll-up
    const subCategories = await SubCategoryModel.find({}).exec()
    const subToSuperMap = new Map<string, string>()
    subCategories.forEach((sc) => {
      if (sc.superCategoryId) {
        subToSuperMap.set(sc._id.toString(), sc.superCategoryId.toString())
      }
    })

    return budgets.map((b) => {
      const limit = parseFloat(b.amount) || 0

      // Match transactions that count towards this budget
      const matchingTxs = transactions.filter((tx) => {
        // If budget targets a person / dependent
        if (b.targetType === 'PERSON' && b.personId) {
          const personMatch = tx.personId && tx.personId.toString() === b.personId.toString()
          if (!personMatch) return false
          if (b.subCategoryId) {
            return tx.subCategoryId && tx.subCategoryId.toString() === b.subCategoryId.toString()
          }
          return true
        }

        // If budget targets a category
        if (b.subCategoryId) {
          return tx.subCategoryId && tx.subCategoryId.toString() === b.subCategoryId.toString()
        }
        if (b.superCategoryId) {
          const directMatch = tx.superCategoryId && tx.superCategoryId.toString() === b.superCategoryId.toString()
          const subMatch = tx.subCategoryId && subToSuperMap.get(tx.subCategoryId.toString()) === b.superCategoryId.toString()
          return Boolean(directMatch || subMatch)
        }

        return false
      })

      const spent = matchingTxs.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
      const remaining = Number((limit - spent).toFixed(2))
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0

      let status: BudgetStatus = 'ON_TRACK'
      if (percentage >= 100) {
        status = 'EXCEEDED'
      } else if (percentage >= 75) {
        status = 'WARNING'
      }

      return {
        id: String(b._id),
        ownerId: String(b.ownerId),
        name: b.name,
        targetType: b.targetType,
        superCategoryId: b.superCategoryId ? String(b.superCategoryId) : undefined,
        subCategoryId: b.subCategoryId ? String(b.subCategoryId) : undefined,
        personId: b.personId ? String(b.personId) : undefined,
        amount: b.amount,
        currency: b.currency,
        period: b.period as any,
        periodYear: b.periodYear,
        periodMonth: b.periodMonth,
        isArchived: b.isArchived,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        createdBy: b.createdBy ? String(b.createdBy) : undefined,
        updatedBy: b.updatedBy ? String(b.updatedBy) : undefined,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        transactionCount: matchingTxs.length,
        status,
      }
    })
  }
}
