import type { PaginationMeta } from '../types/pagination.js'

export function success<T>(data: T): { data: T } {
  return { data }
}

export function paginated<T>(data: T[], pagination: PaginationMeta): { data: T[]; pagination: PaginationMeta } {
  return { data, pagination }
}
