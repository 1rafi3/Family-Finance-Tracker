import { z } from 'zod'
import { MONEY_PATTERN } from '../constants/index.js'

/**
 * Validates a fixed-scale money string with exactly two decimal places.
 * A leading minus sign is allowed (negative balances are schema-permitted).
 */
export const moneySchema = z
  .string()
  .regex(MONEY_PATTERN, 'Must be a money string with exactly 2 decimal places')

/** Validates a strictly positive money string. */
export const positiveMoneySchema = moneySchema.refine(
  (value) => Number(value) > 0,
  'Must be greater than 0',
)

/** Validates a non-negative money string. */
export const nonNegativeMoneySchema = moneySchema.refine(
  (value) => Number(value) >= 0,
  'Must be non-negative',
)
