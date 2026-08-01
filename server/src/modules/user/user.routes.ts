import { Router } from 'express'
import { UserRole, idParamSchema } from '@family-finance/shared'
import { authenticate, authorize, validate } from '../../middleware/index.js'
import { UserController } from './user.controller.js'
import { UserRepository } from './user.repository.js'
import { updateProfileSchema, updateStatusSchema } from './user.schema.js'
import { UserService } from './user.service.js'

const userService = new UserService(new UserRepository())
const userController = new UserController(userService)

export const userRouter = Router()

userRouter.patch('/me', authenticate, validate(updateProfileSchema), userController.updateMe)

userRouter.get('/', authenticate, authorize(UserRole.ADMIN), userController.list)
userRouter.get('/:id', authenticate, authorize(UserRole.ADMIN), validate(idParamSchema, 'params'), userController.getById)
userRouter.patch('/:id', authenticate, authorize(UserRole.ADMIN), validate(idParamSchema, 'params'), validate(updateProfileSchema), userController.update)
userRouter.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), validate(idParamSchema, 'params'), validate(updateStatusSchema), userController.updateStatus)
