export interface PaginationMeta {
  page: number
  limit: number
  total: number
  hasMore: boolean
  nextCursor: string | null
}

export interface PaginatedResult<T> extends PaginationMeta {
  items: T[]
}
