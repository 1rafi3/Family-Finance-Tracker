import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { CategoryType, User } from '@family-finance/shared'
import { ApiError } from '../../utils/ApiError.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { success } from '../../utils/ApiResponse.js'
import { AUTH_ERROR_MESSAGES } from '../auth/auth.constants.js'
import type { CategoryService } from './category.service.js'
import type {
  SubCategoryCreateInput,
  SubCategoryUpdateInput,
  SuperCategoryCreateInput,
  SuperCategoryUpdateInput,
} from '@family-finance/shared'

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // --- SuperCategory Controllers ---

  listSuperCategories = asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as CategoryType | undefined
    const includeArchived = req.query.isArchived === 'true'
    const superCategories = await this.categoryService.listSuperCategories(type, includeArchived)
    res.status(StatusCodes.OK).json(success(superCategories))
  })

  getSuperCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const superCategory = await this.categoryService.getSuperCategoryById(req.params.id)
    res.status(StatusCodes.OK).json(success({ superCategory }))
  })

  createSuperCategory = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const superCategory = await this.categoryService.createSuperCategory({
      ...(req.body as SuperCategoryCreateInput),
      createdBy: user.id,
    })
    res.status(StatusCodes.CREATED).json(success({ superCategory }))
  })

  updateSuperCategory = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const superCategory = await this.categoryService.updateSuperCategory(
      req.params.id,
      {
        ...(req.body as SuperCategoryUpdateInput),
        updatedBy: user.id,
      },
    )
    res.status(StatusCodes.OK).json(success({ superCategory }))
  })

  archiveSuperCategory = asyncHandler(async (req: Request, res: Response) => {
    const superCategory = await this.categoryService.archiveSuperCategory(req.params.id)
    res.status(StatusCodes.OK).json(success({ superCategory }))
  })

  // --- SubCategory Controllers ---

  listSubCategories = asyncHandler(async (req: Request, res: Response) => {
    const superCategoryId = req.query.superCategoryId as string | undefined
    const type = req.query.type as CategoryType | undefined
    const includeArchived = req.query.isArchived === 'true'
    const subCategories = await this.categoryService.listSubCategories(
      superCategoryId,
      type,
      includeArchived,
    )
    res.status(StatusCodes.OK).json(success(subCategories))
  })

  getSubCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const subCategory = await this.categoryService.getSubCategoryById(req.params.id)
    res.status(StatusCodes.OK).json(success({ subCategory }))
  })

  createSubCategory = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const subCategory = await this.categoryService.createSubCategory({
      ...(req.body as SubCategoryCreateInput),
      createdBy: user.id,
    })
    res.status(StatusCodes.CREATED).json(success({ subCategory }))
  })

  updateSubCategory = asyncHandler(async (req: Request, res: Response) => {
    const user = this.requireUser(req)
    const subCategory = await this.categoryService.updateSubCategory(
      req.params.id,
      {
        ...(req.body as SubCategoryUpdateInput),
        updatedBy: user.id,
      },
    )
    res.status(StatusCodes.OK).json(success({ subCategory }))
  })

  archiveSubCategory = asyncHandler(async (req: Request, res: Response) => {
    const subCategory = await this.categoryService.archiveSubCategory(req.params.id)
    res.status(StatusCodes.OK).json(success({ subCategory }))
  })

  private requireUser(req: Request): User {
    if (!req.user) {
      throw ApiError.unauthorized(AUTH_ERROR_MESSAGES.AUTH_REQUIRED)
    }
    return req.user
  }
}
