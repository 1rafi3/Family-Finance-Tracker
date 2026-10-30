import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { LoanCreateInput, LoanUpdateInput, User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { LoanService } from './loan.service.js'

export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const includeArchived = req.query.includeArchived === 'true'
    const loans = await this.loanService.list(user.id, includeArchived)
    res.status(StatusCodes.OK).json(success(loans))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const loan = await this.loanService.getById(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ loan }))
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const loan = await this.loanService.create(user.id, req.body as LoanCreateInput)
    res.status(StatusCodes.CREATED).json(success({ loan }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const loan = await this.loanService.update(
      req.params.id,
      user.id,
      req.body as LoanUpdateInput,
    )
    res.status(StatusCodes.OK).json(success({ loan }))
  })

  archive = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    await this.loanService.archive(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ archived: true }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
