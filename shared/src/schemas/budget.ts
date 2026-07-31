import { z } from 'zod'
import { DEFAULT_BUDGET_PERIOD, DEFAULT_CURRENCY } from '../constants/index.js'
import { BudgetPeriod } from '../enums/index.js'
import type { Budget } from '../types/index.js'
import {
  currencySchema,
  dateSchema,
  idSchema,
  periodMonthSchema,
  periodYearSchema,
  positiveMoneySchema,
} from '../validators/index.js'

/** Subset of the budget shape needed by the period-dependent validation. */
interface BudgetPeriodInput {
  period?: BudgetPeriod
  periodMonth?: number
}

/**
 * `periodMonth` is required when `period` is `MONTHLY` (domain model §3.6).
 */
function validateBudgetPeriod(data: BudgetPeriodInput, ctx: z.RefinementCtx): void {
  if (data.period === BudgetPeriod.MONTHLY && data.periodMonth == null) {
    ctx.addIssue({
      code: 'custom',
      path: ['periodMonth'],
      message: 'Required when period is MONTHLY',
    })
  }
}

const budgetShape = {
  superCategoryId: idSchema,
  amount: positiveMoneySchema,
  currency: currencySchema,
  period: z.nativeEnum(BudgetPeriod),
  periodYear: periodYearSchema,
  periodMonth: periodMonthSchema.optional(),
}

/** Validates creation of a budget (one active per SuperCategory per period). */
export const budgetCreateSchema = z
  .object({
    ...budgetShape,
    currency: currencySchema.default(DEFAULT_CURRENCY),
    period: z.nativeEnum(BudgetPeriod).default(DEFAULT_BUDGET_PERIOD),
  })
  .strict()
  .superRefine(validateBudgetPeriod)

/** Input type of {@link budgetCreateSchema}. */
export type BudgetCreateInput = z.input<typeof budgetCreateSchema>

/** Validates an update to a budget. */
export const budgetUpdateSchema = z
  .object({ ...budgetShape })
  .partial()
  .strict()
  .superRefine(validateBudgetPeriod)

/** Input type of {@link budgetUpdateSchema}. */
export type BudgetUpdateInput = z.input<typeof budgetUpdateSchema>

/** Validates a `Budget` resource. */
export const budgetSchema: z.ZodType<Budget> = z.object({
  id: idSchema,
  superCategoryId: idSchema,
  amount: positiveMoneySchema,
  currency: currencySchema,
  period: z.nativeEnum(BudgetPeriod),
  periodYear: periodYearSchema,
  periodMonth: periodMonthSchema.optional(),
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
