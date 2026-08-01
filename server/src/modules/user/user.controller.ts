import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { UserService } from './user.service.js'
import type { UpdateProfileInput, UpdateStatusInput } from './user.schema.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.userService.listUsers()
    res.status(StatusCodes.OK).json(success(users))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.getUserById(req.params.id)
    res.status(StatusCodes.OK).json(success({ user }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.updateProfile(req.params.id, req.body as UpdateProfileInput)
    res.status(StatusCodes.OK).json(success({ user }))
  })

  updateMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    const user = await this.userService.updateProfile(req.user.id, req.body as UpdateProfileInput)
    res.status(StatusCodes.OK).json(success({ user }))
  })

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    const user = await this.userService.setActiveStatus(req.user.id, req.params.id, (req.body as UpdateStatusInput).isActive)
    res.status(StatusCodes.OK).json(success({ user }))
  })
}
