import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { SavingsGoalCreateInput, SavingsGoalUpdateInput, User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { SavingsGoalService } from './savings-goal.service.js'

export class SavingsGoalController {
  constructor(private readonly savingsGoalService: SavingsGoalService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const includeArchived = req.query.includeArchived === 'true'
    const goals = await this.savingsGoalService.list(user.id, includeArchived)
    res.status(StatusCodes.OK).json(success(goals))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const goal = await this.savingsGoalService.getById(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ goal }))
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const goal = await this.savingsGoalService.create(user.id, req.body as SavingsGoalCreateInput)
    res.status(StatusCodes.CREATED).json(success({ goal }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const goal = await this.savingsGoalService.update(
      req.params.id,
      user.id,
      req.body as SavingsGoalUpdateInput,
    )
    res.status(StatusCodes.OK).json(success({ goal }))
  })

  archive = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    await this.savingsGoalService.archive(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ archived: true }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
