import { z } from 'zod'
import { DEFAULT_CURRENCY, DEFAULT_LOAN_STATUS } from '../constants/index.js'
import { LoanDirection, LoanStatus } from '../enums/index.js'
import type { Loan } from '../types/index.js'
import {
  counterpartyNameSchema,
  currencySchema,
  dateSchema,
  idSchema,
  interestRateSchema,
  nonNegativeMoneySchema,
  notesSchema,
  positiveMoneySchema,
  termMonthsSchema,
} from '../validators/index.js'

/** Validates creation of a loan. `remainingBalance` defaults to `principal`. */
export const loanCreateSchema = z
  .object({
    ownerId: idSchema,
    direction: z.nativeEnum(LoanDirection),
    counterpartyName: counterpartyNameSchema,
    principal: positiveMoneySchema,
    interestRate: interestRateSchema.optional(),
    currency: currencySchema.default(DEFAULT_CURRENCY),
    termMonths: termMonthsSchema.optional(),
    dueDate: dateSchema.optional(),
    status: z.nativeEnum(LoanStatus).default(DEFAULT_LOAN_STATUS),
    notes: notesSchema.optional(),
  })
  .strict()

/** Input type of {@link loanCreateSchema}. */
export type LoanCreateInput = z.input<typeof loanCreateSchema>

/**
 * Validates an update to a loan. Optional numeric/date/text fields accept
 * `null` to clear them (JSON Merge Patch semantics).
 */
export const loanUpdateSchema = z
  .object({
    ownerId: idSchema.optional(),
    direction: z.nativeEnum(LoanDirection).optional(),
    counterpartyName: counterpartyNameSchema.optional(),
    principal: positiveMoneySchema.optional(),
    interestRate: interestRateSchema.optional().nullable(),
    currency: currencySchema.optional(),
    termMonths: termMonthsSchema.optional().nullable(),
    dueDate: dateSchema.optional().nullable(),
    remainingBalance: nonNegativeMoneySchema.optional(),
    status: z.nativeEnum(LoanStatus).optional(),
    notes: notesSchema.optional().nullable(),
  })
  .strict()

/** Input type of {@link loanUpdateSchema}. */
export type LoanUpdateInput = z.input<typeof loanUpdateSchema>

/** Validates a `Loan` resource. */
export const loanSchema: z.ZodType<Loan> = z.object({
  id: idSchema,
  ownerId: idSchema,
  direction: z.nativeEnum(LoanDirection),
  counterpartyName: counterpartyNameSchema,
  principal: positiveMoneySchema,
  interestRate: interestRateSchema.optional(),
  currency: currencySchema,
  termMonths: termMonthsSchema.optional(),
  dueDate: dateSchema.optional(),
  remainingBalance: nonNegativeMoneySchema,
  status: z.nativeEnum(LoanStatus),
  notes: notesSchema.optional(),
  isArchived: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
