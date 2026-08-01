import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { UserRole } from '@family-finance/shared'
import { ApiError } from '../utils/ApiError.js'
import { AUTH_ERROR_MESSAGES } from '../modules/auth/auth.constants.js'

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED))
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', 'Insufficient permissions'))
      return
    }

    next()
  }
}
