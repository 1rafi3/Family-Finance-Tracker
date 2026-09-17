import { ApiError } from '../../utils/ApiError.js'
import type { CategoryType, Id } from '@family-finance/shared'
import {
  SubCategoryRepository,
  SuperCategoryRepository,
  type CreateSubCategoryData,
  type CreateSuperCategoryData,
  type UpdateSubCategoryData,
  type UpdateSuperCategoryData,
} from './category.repository.js'

export class CategoryService {
  constructor(
    private superCatRepo: SuperCategoryRepository = new SuperCategoryRepository(),
    private subCatRepo: SubCategoryRepository = new SubCategoryRepository(),
  ) {}

  // --- SuperCategory Methods ---

  async listSuperCategories(type?: CategoryType, includeArchived = false) {
    return this.superCatRepo.listAll(type, includeArchived)
  }

  async getSuperCategoryById(id: Id) {
    const category = await this.superCatRepo.findById(id)
    if (!category) {
      throw ApiError.notFound('SuperCategory not found')
    }
    return category
  }

  async createSuperCategory(data: CreateSuperCategoryData) {
    const existing = await this.superCatRepo.findByNameAndType(data.name, data.type)
    if (existing) {
      throw ApiError.conflict(`SuperCategory '${data.name}' already exists for type '${data.type}'`)
    }
    return this.superCatRepo.createCategory(data)
  }

  async updateSuperCategory(id: Id, data: UpdateSuperCategoryData) {
    const category = await this.getSuperCategoryById(id)

    if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await this.superCatRepo.findByNameAndType(data.name, category.type)
      if (existing) {
        throw ApiError.conflict(`SuperCategory '${data.name}' already exists for type '${category.type}'`)
      }
    }

    const updated = await this.superCatRepo.updateById(id, data)
    if (!updated) {
      throw ApiError.notFound('SuperCategory not found for update')
    }
    return updated
  }

  async archiveSuperCategory(id: Id) {
    const category = await this.getSuperCategoryById(id)
    if (category.isSystem) {
      throw ApiError.badRequest('System categories cannot be archived')
    }
    return this.superCatRepo.updateById(id, { isArchived: true })
  }

  // --- SubCategory Methods ---

  async listSubCategories(superCategoryId?: Id, type?: CategoryType, includeArchived = false) {
    return this.subCatRepo.listAll(superCategoryId, type, includeArchived)
  }

  async getSubCategoryById(id: Id) {
    const subCategory = await this.subCatRepo.findById(id)
    if (!subCategory) {
      throw ApiError.notFound('SubCategory not found')
    }
    return subCategory
  }

  async createSubCategory(data: CreateSubCategoryData) {
    const parent = await this.getSuperCategoryById(data.superCategoryId)
    if (parent.type !== data.type) {
      throw ApiError.badRequest(
        `SubCategory type '${data.type}' must match parent SuperCategory type '${parent.type}'`,
      )
    }

    const existing = await this.subCatRepo.findByNameAndParent(data.superCategoryId, data.name)
    if (existing) {
      throw ApiError.conflict(`SubCategory '${data.name}' already exists in this parent category`)
    }

    return this.subCatRepo.createSubCategory(data)
  }

  async updateSubCategory(id: Id, data: UpdateSubCategoryData) {
    const subCategory = await this.getSubCategoryById(id)
    const targetParentId: Id = data.superCategoryId ?? subCategory.superCategoryId.toString()
    const parent = await this.getSuperCategoryById(targetParentId)

    if (parent.type !== subCategory.type) {
      throw ApiError.badRequest(
        `SubCategory type '${subCategory.type}' must match parent SuperCategory type '${parent.type}'`,
      )
    }

    if (data.name && data.name.toLowerCase() !== subCategory.name.toLowerCase()) {
      const existing = await this.subCatRepo.findByNameAndParent(targetParentId, data.name)
      if (existing) {
        throw ApiError.conflict(`SubCategory '${data.name}' already exists in this parent category`)
      }
    }

    const updated = await this.subCatRepo.updateById(id, data)
    if (!updated) {
      throw ApiError.notFound('SubCategory not found for update')
    }
    return updated
  }

  async archiveSubCategory(id: Id) {
    await this.getSubCategoryById(id)
    return this.subCatRepo.updateById(id, { isArchived: true })
  }
}
