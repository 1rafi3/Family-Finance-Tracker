import { StatusCodes } from 'http-status-codes'
import { UserRole } from '@family-finance/shared'
import type { User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { signAccessToken } from '../../utils/jwt.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import { serializeUser } from '../../utils/userSerializer.js'
import { AUTH_ERROR_MESSAGES } from './auth.constants.js'
import type { AuthRepository } from './auth.repository.js'
import type { ChangePasswordInput, LoginInput, RegisterInput } from './auth.schema.js'
import type { AuthenticatedSession } from './auth.types.js'

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ user: User }> {
    const existing = await this.authRepository.findByEmail(input.email)
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'EMAIL_IN_USE', AUTH_ERROR_MESSAGES.EMAIL_IN_USE)
    }

    const isBootstrapAdmin = (await this.authRepository.countAdmins()) === 0
    const passwordHash = await hashPassword(input.password)
    const user = await this.authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: isBootstrapAdmin ? UserRole.ADMIN : UserRole.MEMBER,
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

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.authRepository.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'TOKEN_INVALID', AUTH_ERROR_MESSAGES.TOKEN_INVALID)
    }

    const currentPasswordMatches = await verifyPassword(input.currentPassword, user.passwordHash)
    if (!currentPasswordMatches) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'PASSWORD_INCORRECT', AUTH_ERROR_MESSAGES.PASSWORD_INCORRECT)
    }
    if (input.newPassword === input.currentPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'PASSWORD_UNCHANGED', AUTH_ERROR_MESSAGES.PASSWORD_UNCHANGED)
    }

    await this.authRepository.updatePassword(userId, await hashPassword(input.newPassword))
  }

  async logout(): Promise<void> {
    // Stateless JWT in V1: no server-side session to invalidate.
    // Future: persist a revoked-jti blocklist here to support refresh tokens.
  }
}
