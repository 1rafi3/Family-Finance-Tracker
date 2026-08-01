import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { paginatedCursor, success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { TransactionService } from './transaction.service.js'
import type { TransactionCreateInput, TransactionListQuery, TransactionUpdateInput } from './transaction.schema.js'

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.createTransaction(this.requireUser(req), req.body as TransactionCreateInput)
    res.status(StatusCodes.CREATED).json(success({ transaction }))
  })

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.transactionService.listTransactions(
      this.requireUser(req),
      req.query as unknown as TransactionListQuery,
    )
    res.status(StatusCodes.OK).json(paginatedCursor(result.data, result.pagination))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.getTransaction(this.requireUser(req), req.params.id)
    res.status(StatusCodes.OK).json(success({ transaction }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.updateTransaction(
      this.requireUser(req),
      req.params.id,
      req.body as TransactionUpdateInput,
    )
    res.status(StatusCodes.OK).json(success({ transaction }))
  })

  void = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.voidTransaction(this.requireUser(req), req.params.id)
    res.status(StatusCodes.OK).json(success({ transaction }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
