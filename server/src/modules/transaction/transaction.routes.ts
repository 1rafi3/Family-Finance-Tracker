import { Router } from 'express'
import {
  idParamSchema,
  transactionCreateSchema,
  transactionUpdateSchema,
} from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { TransactionController } from './transaction.controller.js'
import { TransactionRepository } from './transaction.repository.js'
import { transactionListQuerySchema } from './transaction.schema.js'
import { TransactionService } from './transaction.service.js'
import { WalletRepository } from '../wallet/wallet.repository.js'
import { WalletService } from '../wallet/wallet.service.js'

const transactionService = new TransactionService(
  new TransactionRepository(),
  new WalletRepository(),
  new WalletService(new WalletRepository()),
)
const transactionController = new TransactionController(transactionService)

export const transactionRouter = Router()

transactionRouter.use(authenticate)

transactionRouter.get(
  '/',
  validate(transactionListQuerySchema, 'query'),
  transactionController.list,
)
transactionRouter.post('/', validate(transactionCreateSchema), transactionController.create)
transactionRouter.get('/:id', validate(idParamSchema, 'params'), transactionController.getById)
transactionRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(transactionUpdateSchema),
  transactionController.update,
)
transactionRouter.delete('/:id', validate(idParamSchema, 'params'), transactionController.void)
