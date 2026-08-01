import { Router } from 'express'
import { authenticate, validate } from '../../middleware/index.js'
import { AuthController } from './auth.controller.js'
import { authRepository } from './auth.repository.js'
import { loginSchema, registerSchema } from './auth.schema.js'
import { AuthService } from './auth.service.js'

const authService = new AuthService(authRepository)
const authController = new AuthController(authService)

export const authRouter = Router()

authRouter.post('/register', validate(registerSchema), authController.register)
authRouter.post('/login', validate(loginSchema), authController.login)
authRouter.get('/me', authenticate, authController.me)
