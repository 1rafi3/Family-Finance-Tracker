import type { NextFunction, Request, Response } from 'express'
import { authRepository } from '../modules/auth/auth.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { serializeUser } from '../utils/userSerializer.js'
import { AUTH_ERROR_MESSAGES } from '../modules/auth/auth.constants.js'

const BEARER_PREFIX = 'Bearer '

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith(BEARER_PREFIX)) {
      next(ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED))
      return
    }

    const token = authorization.slice(BEARER_PREFIX.length).trim()
    const payload = verifyAccessToken(token)

    const user = await authRepository.findActiveById(payload.sub)
    if (!user) {
      next(ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED))
      return
    }

    req.user = serializeUser(user)
    next()
  } catch (error) {
    next(error)
  }
}
