import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '@family-finance/shared'
import type { PaginationMeta } from '../types/pagination.js'

export type SortDirection = 1 | -1 | 'asc' | 'desc'

export interface PaginationParams {
  page: number
  limit: number
}

export function resolvePagination(query: { page?: unknown; limit?: unknown }): PaginationParams {
  const page = parsePositiveInt(query.page) ?? DEFAULT_PAGE
  const limit = clamp(parsePositiveInt(query.limit) ?? DEFAULT_PAGE_LIMIT, 1, MAX_PAGE_LIMIT)
  return { page, limit }
}

export function resolveSort(value: unknown, allowedFields: readonly string[]): Record<string, SortDirection> {
  if (typeof value !== 'string' || value.length === 0) {
    return {}
  }
  const sort: Record<string, SortDirection> = {}
  for (const raw of value.split(',')) {
    const field = raw.trim()
    if (field.length === 0) {
      continue
    }
    const descending = field.startsWith('-')
    const name = descending ? field.slice(1) : field
    if (allowedFields.includes(name)) {
      sort[name] = descending ? -1 : 1
    }
  }
  return sort
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, hasMore: page * limit < total, nextCursor: null }
}

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
