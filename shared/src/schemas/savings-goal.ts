import { z } from 'zod'
import { DEFAULT_CURRENCY, DEFAULT_SAVINGS_GOAL_STATUS, ZERO_MONEY } from '../constants/index.js'
import { SavingsGoalStatus } from '../enums/index.js'
import type { SavingsGoal } from '../types/index.js'
import {
  currencySchema,
  dateSchema,
  idSchema,
  nameSchema,
  nonNegativeMoneySchema,
  notesSchema,
  positiveMoneySchema,
} from '../validators/index.js'

const savingsGoalShape = {
  ownerId: idSchema,
  name: nameSchema,
  targetAmount: positiveMoneySchema,
  currentAmount: nonNegativeMoneySchema,
  currency: currencySchema,
  deadline: dateSchema.optional(),
  status: z.nativeEnum(SavingsGoalStatus),
  notes: notesSchema.optional(),
}

/** Validates creation of a savings goal. `currentAmount` defaults to zero. */
export const savingsGoalCreateSchema = z
  .object({
    ...savingsGoalShape,
    currentAmount: nonNegativeMoneySchema.default(ZERO_MONEY),
    currency: currencySchema.default(DEFAULT_CURRENCY),
    status: z.nativeEnum(SavingsGoalStatus).default(DEFAULT_SAVINGS_GOAL_STATUS),
  })
  .strict()

/** Input type of {@link savingsGoalCreateSchema}. */
export type SavingsGoalCreateInput = z.input<typeof savingsGoalCreateSchema>

/**
 * Validates an update to a savings goal. Optional text/date fields accept
 * `null` to clear them (JSON Merge Patch semantics).
 */
export const savingsGoalUpdateSchema = z
  .object({
    ownerId: idSchema.optional(),
    name: nameSchema.optional(),
    targetAmount: positiveMoneySchema.optional(),
    currentAmount: nonNegativeMoneySchema.optional(),
    currency: currencySchema.optional(),
    deadline: dateSchema.optional().nullable(),
    status: z.nativeEnum(SavingsGoalStatus).optional(),
    notes: notesSchema.optional().nullable(),
  })
  .strict()

/** Input type of {@link savingsGoalUpdateSchema}. */
export type SavingsGoalUpdateInput = z.input<typeof savingsGoalUpdateSchema>

/** Validates a `SavingsGoal` resource. */
export const savingsGoalSchema: z.ZodType<SavingsGoal> = z.object({
  id: idSchema,
  ownerId: idSchema,
  name: nameSchema,
  targetAmount: positiveMoneySchema,
  currentAmount: nonNegativeMoneySchema,
  currency: currencySchema,
  deadline: dateSchema.optional(),
  status: z.nativeEnum(SavingsGoalStatus),
  notes: notesSchema.optional(),
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
