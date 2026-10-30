import { StatusCodes } from 'http-status-codes'
import type {
  Id,
  SavingsGoal,
  SavingsGoalCreateInput,
  SavingsGoalUpdateInput,
} from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { SavingsGoalRepository } from './savings-goal.repository.js'

export class SavingsGoalService {
  constructor(private readonly repo = new SavingsGoalRepository()) {}

  async list(ownerId: Id, includeArchived = false): Promise<SavingsGoal[]> {
    return this.repo.listByOwner(ownerId, includeArchived)
  }

  async getById(id: Id, ownerId: Id): Promise<SavingsGoal> {
    const goal = await this.repo.findByIdAndOwner(id, ownerId)
    if (!goal) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Savings goal not found')
    }
    return goal
  }

  async create(ownerId: Id, input: SavingsGoalCreateInput): Promise<SavingsGoal> {
    return this.repo.create({ ...input, ownerId })
  }

  async update(id: Id, ownerId: Id, input: SavingsGoalUpdateInput): Promise<SavingsGoal> {
    const existing = await this.repo.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Savings goal not found')
    }

    const updated = await this.repo.update(id, ownerId, input)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Savings goal not found')
    }
    return updated
  }

  async archive(id: Id, ownerId: Id): Promise<void> {
    const existing = await this.repo.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Savings goal not found')
    }
    await this.repo.archive(id, ownerId)
  }
}
