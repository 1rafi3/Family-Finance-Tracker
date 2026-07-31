import { z } from 'zod'
import {
  INTEREST_RATE_MAX,
  INTEREST_RATE_MIN,
  PERIOD_MONTH_MAX,
  PERIOD_MONTH_MIN,
  PERIOD_YEAR_MAX,
  PERIOD_YEAR_MIN,
  TERM_MONTHS_MIN,
} from '../constants/index.js'

/** Validates a non-negative integer. */
export const nonNegativeIntSchema = z.number().int().nonnegative()

/** Validates a strictly positive integer. */
export const positiveIntSchema = z.number().int().positive()

/** Validates an interest rate percentage (0–100, decimal allowed). */
export const interestRateSchema = z.number().min(INTEREST_RATE_MIN).max(INTEREST_RATE_MAX)

/** Validates a loan term in months (> 0). */
export const termMonthsSchema = z.number().int().min(TERM_MONTHS_MIN)

/** Validates a budget period month (1–12). */
export const periodMonthSchema = z.number().int().min(PERIOD_MONTH_MIN).max(PERIOD_MONTH_MAX)

/** Validates a budget period year. */
export const periodYearSchema = z.number().int().min(PERIOD_YEAR_MIN).max(PERIOD_YEAR_MAX)
