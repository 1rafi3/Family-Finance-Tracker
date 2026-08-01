import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { WalletService } from './wallet.service.js'
import type { WalletCreateInput, WalletUpdateInput } from './wallet.schema.js'

export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await this.walletService.createWallet(this.requireUser(req).id, req.body as WalletCreateInput)
    res.status(StatusCodes.CREATED).json(success({ wallet }))
  })

  list = asyncHandler(async (req: Request, res: Response) => {
    const wallets = await this.walletService.listWallets(this.requireUser(req).id)
    res.status(StatusCodes.OK).json(success(wallets))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await this.walletService.getWallet(this.requireUser(req).id, req.params.id)
    res.status(StatusCodes.OK).json(success({ wallet }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await this.walletService.updateWallet(this.requireUser(req).id, req.params.id, req.body as WalletUpdateInput)
    res.status(StatusCodes.OK).json(success({ wallet }))
  })

  archive = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await this.walletService.archiveWallet(this.requireUser(req).id, req.params.id)
    res.status(StatusCodes.OK).json(success({ wallet }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
