import { Router } from 'express'
import {
  idParamSchema,
  subCategoryCreateSchema,
  subCategoryUpdateSchema,
  superCategoryCreateSchema,
  superCategoryUpdateSchema,
} from '@family-finance/shared'
import { authenticate, validate } from '../../middleware/index.js'
import { CategoryController } from './category.controller.js'
import { CategoryService } from './category.service.js'

const categoryService = new CategoryService()
const categoryController = new CategoryController(categoryService)

export const categoryRouter = Router()

categoryRouter.use(authenticate)

// --- SuperCategory Routes ---
categoryRouter.get('/super', categoryController.listSuperCategories)
categoryRouter.get(
  '/super/:id',
  validate(idParamSchema, 'params'),
  categoryController.getSuperCategoryById,
)
categoryRouter.post(
  '/super',
  validate(superCategoryCreateSchema),
  categoryController.createSuperCategory,
)
categoryRouter.patch(
  '/super/:id',
  validate(idParamSchema, 'params'),
  validate(superCategoryUpdateSchema),
  categoryController.updateSuperCategory,
)
categoryRouter.delete(
  '/super/:id',
  validate(idParamSchema, 'params'),
  categoryController.archiveSuperCategory,
)

// --- SubCategory Routes ---
categoryRouter.get('/sub', categoryController.listSubCategories)
categoryRouter.get(
  '/sub/:id',
  validate(idParamSchema, 'params'),
  categoryController.getSubCategoryById,
)
categoryRouter.post(
  '/sub',
  validate(subCategoryCreateSchema),
  categoryController.createSubCategory,
)
categoryRouter.patch(
  '/sub/:id',
  validate(idParamSchema, 'params'),
  validate(subCategoryUpdateSchema),
  categoryController.updateSubCategory,
)
categoryRouter.delete(
  '/sub/:id',
  validate(idParamSchema, 'params'),
  categoryController.archiveSubCategory,
)
