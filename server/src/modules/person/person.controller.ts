import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { CreatePersonInput, UpdatePersonInput, User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { PersonService } from './person.service.js'

export class PersonController {
  constructor(private readonly personService: PersonService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const includeArchived = req.query.isArchived === 'true'
    const people = await this.personService.listPeople(user.id, includeArchived)
    res.status(StatusCodes.OK).json(success(people))
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const person = await this.personService.getPerson(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ person }))
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const person = await this.personService.createPerson(user.id, req.body as CreatePersonInput)
    res.status(StatusCodes.CREATED).json(success({ person }))
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const person = await this.personService.updatePerson(
      req.params.id,
      user.id,
      req.body as UpdatePersonInput,
    )
    res.status(StatusCodes.OK).json(success({ person }))
  })

  archive = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const person = await this.personService.archivePerson(req.params.id, user.id)
    res.status(StatusCodes.OK).json(success({ person }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
