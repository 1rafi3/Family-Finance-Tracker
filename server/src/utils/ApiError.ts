import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.BAD_REQUEST, 'BAD_REQUEST', message, details)
  }

  static unauthorized(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHENTICATED', message, details)
  }

  static forbidden(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.FORBIDDEN, 'FORBIDDEN', message, details)
  }

  static notFound(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.NOT_FOUND, 'NOT_FOUND', message, details)
  }

  static conflict(message: string, code = 'CONFLICT', details?: unknown): ApiError {
    return new ApiError(StatusCodes.CONFLICT, code, message, details)
  }

  static unprocessable(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_FAILED', message, details)
  }

  static internal(message: string, details?: unknown): ApiError {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', message, details)
  }
}
