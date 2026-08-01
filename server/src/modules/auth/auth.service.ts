import { StatusCodes } from 'http-status-codes'
import type { User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { signAccessToken } from '../../utils/jwt.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import { serializeUser } from '../../utils/userSerializer.js'
import { AUTH_ERROR_MESSAGES } from './auth.constants.js'
import type { AuthRepository } from './auth.repository.js'
import type { LoginInput, RegisterInput } from './auth.schema.js'
import type { AuthenticatedSession } from './auth.types.js'

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ user: User }> {
    const existing = await this.authRepository.findByEmail(input.email)
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'EMAIL_IN_USE', AUTH_ERROR_MESSAGES.EMAIL_IN_USE)
    }

    const passwordHash = await hashPassword(input.password)
    const user = await this.authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    })

    return { user: serializeUser(user) }
  }

  async login(input: LoginInput): Promise<AuthenticatedSession> {
    const user = await this.authRepository.findByEmail(input.email)
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS', AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }
    if (!user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'INVALID_CREDENTIALS', AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    user.lastLoginAt = new Date()
    await this.authRepository.updateLastLoginAt(user.id)

    return {
      accessToken: signAccessToken({ sub: user.id, role: user.role }),
      user: serializeUser(user),
    }
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.authRepository.findActiveById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'TOKEN_INVALID', AUTH_ERROR_MESSAGES.TOKEN_INVALID)
    }
    return serializeUser(user)
  }
}
