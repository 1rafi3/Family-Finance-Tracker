import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { UserRole } from '@family-finance/shared'
import { env } from '../config/env.js'
import { ApiError } from './ApiError.js'

export interface AccessTokenPayload {
  /** Subject: the authenticated user's ID. */
  sub: string
  /** Role claim; server-side authorization always uses the live user from the DB. */
  role: UserRole
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') {
      throw new Error('Unexpected token payload')
    }
    return { sub: decoded.sub, role: decoded.role as UserRole }
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'TOKEN_INVALID', 'Invalid or expired token')
  }
}
