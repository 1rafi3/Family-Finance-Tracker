import { Router } from 'express'
import {
  loanCreateSchema,
  loanUpdateSchema,
  idParamSchema,
} from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { LoanController } from './loan.controller.js'
import { LoanService } from './loan.service.js'

const loanService = new LoanService()
const loanController = new LoanController(loanService)

export const loanRouter = Router()

loanRouter.use(authenticate)

loanRouter.get('/', loanController.list)
loanRouter.get('/:id', validate(idParamSchema, 'params'), loanController.getById)
loanRouter.post('/', validate(loanCreateSchema), loanController.create)
loanRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(loanUpdateSchema),
  loanController.update,
)
loanRouter.delete('/:id', validate(idParamSchema, 'params'), loanController.archive)
