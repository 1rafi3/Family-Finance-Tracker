import { StatusCodes } from 'http-status-codes'
import type { User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { serializeUser } from '../../utils/userSerializer.js'
import { USER_ERROR_MESSAGES } from './user.constants.js'
import type { UserRepository } from './user.repository.js'
import type { UpdateProfileInput } from './user.schema.js'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async listUsers(): Promise<User[]> {
    const users = await this.userRepository.listActiveUsers()
    return users.map(serializeUser)
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'USER_NOT_FOUND', USER_ERROR_MESSAGES.NOT_FOUND)
    }
    return serializeUser(user)
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const updated = await this.userRepository.updateName(userId, input)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'USER_NOT_FOUND', USER_ERROR_MESSAGES.NOT_FOUND)
    }
    return serializeUser(updated)
  }

  async setActiveStatus(actorId: string, targetId: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findById(targetId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'USER_NOT_FOUND', USER_ERROR_MESSAGES.NOT_FOUND)
    }
    if (!isActive && actorId === targetId) {
      throw new ApiError(StatusCodes.CONFLICT, 'CANNOT_DEACTIVATE_SELF', USER_ERROR_MESSAGES.CANNOT_DEACTIVATE_SELF)
    }
    if (!isActive && !user.isActive) {
      throw new ApiError(StatusCodes.CONFLICT, 'USER_INACTIVE', USER_ERROR_MESSAGES.INACTIVE)
    }

    const updated = await this.userRepository.setActiveStatus(targetId, isActive)
    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'USER_NOT_FOUND', USER_ERROR_MESSAGES.NOT_FOUND)
    }
    return serializeUser(updated)
  }
}
