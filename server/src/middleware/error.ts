import type { NextFunction, Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { ApiError } from '../utils/ApiError.js'
import { formatZodIssues } from '../utils/zodError.js'
import type { FieldError } from '../types/api.js'

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error: { code: 'VALIDATION_FAILED', message: 'Request validation failed', details: formatZodIssues(err) },
    })
    return
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details: FieldError[] = Object.entries(err.errors).map(([field, error]) => ({
      field,
      code: 'VALIDATION_FAILED',
      message: error.message,
    }))
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details },
    })
    return
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: { code: 'INVALID_ID', message: 'Invalid resource identifier' },
    })
    return
  }

  if (isDuplicateKeyError(err)) {
    res.status(StatusCodes.CONFLICT).json({
      error: { code: 'DUPLICATE_KEY', message: 'Resource already exists' },
    })
    return
  }

  if (isBodyParserError(err)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
    })
    return
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack })

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? ReasonPhrases.INTERNAL_SERVER_ERROR : err.message,
    },
  })
}

function isDuplicateKeyError(err: unknown): err is { code?: number } {
  return err instanceof Error && typeof (err as { code?: unknown }).code === 'number' && (err as { code?: number }).code === 11000
}

function isBodyParserError(err: unknown): err is SyntaxError & { type?: string } {
  return err instanceof SyntaxError && (err as { type?: string }).type === 'entity.parse.failed'
}
