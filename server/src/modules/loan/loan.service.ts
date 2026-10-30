import { StatusCodes } from 'http-status-codes'
import type { Id, Loan, LoanCreateInput, LoanUpdateInput } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { LoanRepository } from './loan.repository.js'

export class LoanService {
  constructor(private readonly repo = new LoanRepository()) {}

  async list(ownerId: Id, includeArchived = false): Promise<Loan[]> {
    return this.repo.listByOwner(ownerId, includeArchived)
  }

  async getById(id: Id, ownerId: Id): Promise<Loan> {
    const loan = await this.repo.findByIdAndOwner(id, ownerId)
    if (!loan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Loan not found')
    }
    return loan
  }

  async create(ownerId: Id, input: LoanCreateInput): Promise<Loan> {
    return this.repo.create({ ...input, ownerId })
  }

  async update(id: Id, ownerId: Id, input: LoanUpdateInput): Promise<Loan> {
    const existing = await this.repo.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Loan not found')
    }

    const updated = await this.repo.update(id, ownerId, input)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Loan not found')
    }
    return updated
  }

  async archive(id: Id, ownerId: Id): Promise<void> {
    const existing = await this.repo.findByIdAndOwner(id, ownerId)
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', 'Loan not found')
    }
    await this.repo.archive(id, ownerId)
  }
}
