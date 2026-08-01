import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from './auth.constants.js'
import type { AuthService } from './auth.service.js'
import type { ChangePasswordInput, LoginInput, RegisterInput } from './auth.schema.js'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body as RegisterInput)
    res.status(StatusCodes.CREATED).json(success(result))
  })

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body as LoginInput)
    res.status(StatusCodes.OK).json(success(result))
  })

  me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    const user = await this.authService.getMe(req.user.id)
    res.status(StatusCodes.OK).json(success({ user }))
  })

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    await this.authService.changePassword(req.user.id, req.body as ChangePasswordInput)
    res.status(StatusCodes.OK).json(success({ success: true }))
  })

  logout = asyncHandler(async (_req: Request, res: Response) => {
    await this.authService.logout()
    res.status(StatusCodes.OK).json(success({ success: true }))
  })
}
