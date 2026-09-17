import { Router } from 'express'
import { createPersonSchema, idParamSchema, updatePersonSchema } from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { PersonController } from './person.controller.js'
import { PersonService } from './person.service.js'

const personService = new PersonService()
const personController = new PersonController(personService)

export const personRouter = Router()

personRouter.use(authenticate)

personRouter.get('/', personController.list)
personRouter.get('/:id', validate(idParamSchema, 'params'), personController.getById)
personRouter.post('/', validate(createPersonSchema), personController.create)
personRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updatePersonSchema),
  personController.update,
)
personRouter.delete('/:id', validate(idParamSchema, 'params'), personController.archive)
