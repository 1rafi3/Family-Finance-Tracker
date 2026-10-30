import { Router } from 'express'
import {
  savingsGoalCreateSchema,
  savingsGoalUpdateSchema,
  idParamSchema,
} from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { SavingsGoalController } from './savings-goal.controller.js'
import { SavingsGoalService } from './savings-goal.service.js'

const savingsGoalService = new SavingsGoalService()
const savingsGoalController = new SavingsGoalController(savingsGoalService)

export const savingsGoalRouter = Router()

savingsGoalRouter.use(authenticate)

savingsGoalRouter.get('/', savingsGoalController.list)
savingsGoalRouter.get('/:id', validate(idParamSchema, 'params'), savingsGoalController.getById)
savingsGoalRouter.post('/', validate(savingsGoalCreateSchema), savingsGoalController.create)
savingsGoalRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(savingsGoalUpdateSchema),
  savingsGoalController.update,
)
savingsGoalRouter.delete('/:id', validate(idParamSchema, 'params'), savingsGoalController.archive)
