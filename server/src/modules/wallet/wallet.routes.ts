import { Router } from 'express'
import { idParamSchema } from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { WalletController } from './wallet.controller.js'
import { WalletRepository } from './wallet.repository.js'
import { walletCreateSchema, walletUpdateSchema } from './wallet.schema.js'
import { WalletService } from './wallet.service.js'

const walletService = new WalletService(new WalletRepository())
const walletController = new WalletController(walletService)

export const walletRouter = Router()

walletRouter.use(authenticate)

walletRouter.post('/', validate(walletCreateSchema), walletController.create)
walletRouter.get('/', walletController.list)
walletRouter.get('/:id', validate(idParamSchema, 'params'), walletController.getById)
walletRouter.patch('/:id', validate(idParamSchema, 'params'), validate(walletUpdateSchema), walletController.update)
walletRouter.delete('/:id', validate(idParamSchema, 'params'), walletController.archive)
