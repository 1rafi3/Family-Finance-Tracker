import { StatusCodes } from 'http-status-codes'
import type {
  BudgetCreateInput,
  BudgetQueryInput,
  BudgetUpdateInput,
  BudgetWithAnalytics,
  Id,
} from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { BudgetRepository } from './budget.repository.js'

export class BudgetService {
  constructor(private readonly budgetRepository = new BudgetRepository()) {}

  async listBudgets(ownerId: Id, query: BudgetQueryInput): Promise<BudgetWithAnalytics[]> {
    const now = new Date()
    const year = query.year ?? now.getFullYear()
    const month = query.month ?? now.getMonth() + 1
    const includeArchived = query.includeArchived ?? false

    const budgets = await this.budgetRepository.listByOwner(ownerId, year, month, includeArchived)
    return this.budgetRepository.attachAnalytics(ownerId, budgets, year, month)
  }

  async getBudgetById(id: Id, ownerId: Id): Promise<BudgetWithAnalytics> {
    const budget = await this.budgetRepository.findByIdAndOwner(id, ownerId)
    if (!budget) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Budget not found')
    }

    const now = new Date()
    const year = budget.periodYear ?? now.getFullYear()
    const month = budget.periodMonth ?? now.getMonth() + 1

    const [enriched] = await this.budgetRepository.attachAnalytics(ownerId, [budget], year, month)
    return enriched
  }

  async createBudget(ownerId: Id, input: BudgetCreateInput): Promise<BudgetWithAnalytics> {
    const now = new Date()
    const year = input.periodYear ?? now.getFullYear()
    const month = input.periodMonth ?? now.getMonth() + 1

    // Check for duplicate active budget for this target and period
    const existing = await this.budgetRepository.listByOwner(ownerId, year, month, false)
    const duplicate = existing.find((b) => {
      if (input.targetType === 'PERSON' && input.personId) {
        return b.personId?.toString() === input.personId && b.subCategoryId?.toString() === input.subCategoryId
      }
      if (input.subCategoryId) {
        return b.subCategoryId?.toString() === input.subCategoryId
      }
      if (input.superCategoryId) {
        return b.superCategoryId?.toString() === input.superCategoryId
      }
      return false
    })

    if (duplicate) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'DUPLICATE_BUDGET',
        'An active budget or allowance already exists for this target in this period',
      )
    }

    const created = await this.budgetRepository.createBudget({
      ownerId,
      name: input.name,
      targetType: input.targetType ?? (input.personId ? 'PERSON' : 'CATEGORY'),
      superCategoryId: input.superCategoryId,
      subCategoryId: input.subCategoryId,
      personId: input.personId,
      amount: input.amount,
      currency: input.currency,
      period: input.period,
      periodYear: year,
      periodMonth: month,
      createdBy: ownerId,
    })

    const [enriched] = await this.budgetRepository.attachAnalytics(ownerId, [created], year, month)
    return enriched
  }

  async updateBudget(id: Id, ownerId: Id, input: BudgetUpdateInput): Promise<BudgetWithAnalytics> {
    const existing = await this.budgetRepository.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Budget not found')
    }

    const updated = await this.budgetRepository.updateBudget(id, ownerId, {
      ...input,
      updatedBy: ownerId,
    })

    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Budget not found')
    }

    const year = updated.periodYear
    const month = updated.periodMonth ?? new Date().getMonth() + 1
    const [enriched] = await this.budgetRepository.attachAnalytics(ownerId, [updated], year, month)
    return enriched
  }

  async archiveBudget(id: Id, ownerId: Id): Promise<void> {
    const existing = await this.budgetRepository.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Budget not found')
    }
    await this.budgetRepository.archiveBudget(id, ownerId)
  }
}
