import type { CursorPaginationMeta, PaginationMeta } from '../types/pagination.js'

export function success<T>(data: T): { data: T } {
  return { data }
}

export function paginated<T>(
  data: T[],
  pagination: PaginationMeta,
): { data: T[]; pagination: PaginationMeta } {
  return { data, pagination }
}

export function paginatedCursor<T>(
  data: T[],
  pagination: CursorPaginationMeta,
): { data: T[]; pagination: CursorPaginationMeta } {
  return { data, pagination }
}
