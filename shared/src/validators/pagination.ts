import { z } from 'zod'
import {
  DEFAULT_CURSOR_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_CURSOR_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/index.js'
import { idSchema } from './id.js'

/** Validates an offset-pagination query object (`page`, `limit`). */
export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  })
  .strict()

/** Validates a cursor-pagination query object (`limit`, `cursor`). */
export const cursorPaginationQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(MAX_CURSOR_LIMIT).default(DEFAULT_CURSOR_LIMIT),
    cursor: z.string().min(1).optional(),
  })
  .strict()

/** Validates a route parameter containing an `id`. */
export const idParamSchema = z.object({ id: idSchema }).strict()

/** Input type of {@link paginationQuerySchema}. */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

/** Input type of {@link cursorPaginationQuerySchema}. */
export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>

/** Input type of {@link idParamSchema}. */
export type IdParam = z.infer<typeof idParamSchema>
