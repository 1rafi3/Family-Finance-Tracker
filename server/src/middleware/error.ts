import type { NextFunction, Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      'NOT_FOUND',
      `Route not found: ${req.method} ${req.originalUrl}`,
    ),
  )
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    })
    return
  }

  console.error(err)

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? ReasonPhrases.INTERNAL_SERVER_ERROR : err.message,
    },
  })
}
