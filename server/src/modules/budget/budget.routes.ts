import { Router } from 'express'
import {
  budgetCreateSchema,
  budgetUpdateSchema,
  idParamSchema,
} from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { BudgetController } from './budget.controller.js'
import { BudgetService } from './budget.service.js'

const budgetService = new BudgetService()
const budgetController = new BudgetController(budgetService)

export const budgetRouter = Router()

budgetRouter.use(authenticate)

budgetRouter.get('/', budgetController.list)
budgetRouter.get('/:id', validate(idParamSchema, 'params'), budgetController.getById)
budgetRouter.post('/', validate(budgetCreateSchema), budgetController.create)
budgetRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(budgetUpdateSchema),
  budgetController.update,
)
budgetRouter.delete('/:id', validate(idParamSchema, 'params'), budgetController.archive)
