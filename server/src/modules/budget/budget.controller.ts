import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { BudgetCreateInput, BudgetQueryInput, BudgetUpdateInput, User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { BudgetService } from './budget.service.js'

export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const query: BudgetQueryInput = {
      year: req.query.year ? Number(req.query.year) : undefined,
      month: req.query.month ? Number(req.query.month) : undefined,
      includeArchived: req.query.includeArchived === 'true',
    }
    const budgets = await this.budgetService.listBudgets(user.id, query)
    res.status(StatusCodes.OK).json(success(budgets))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const budget = await this.budgetService.getBudgetById(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ budget }))
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const budget = await this.budgetService.createBudget(user.id, req.body as BudgetCreateInput)
    res.status(StatusCodes.CREATED).json(success({ budget }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const budget = await this.budgetService.updateBudget(
      req.params.id,
      user.id,
      req.body as BudgetUpdateInput,
    )
    res.status(StatusCodes.OK).json(success({ budget }))
  })

  archive = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    await this.budgetService.archiveBudget(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ archived: true }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
