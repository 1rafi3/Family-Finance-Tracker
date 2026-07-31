/**
 * Default currency for the application. BDT is the only currency in V1
 * (domain model §2.6).
 */
export const DEFAULT_CURRENCY = 'BDT'

/** Currencies supported by the application in V1. */
export const SUPPORTED_CURRENCIES = ['BDT'] as const

/** Number of fractional digits used by the fixed-scale money format (poisha). */
export const MONEY_DECIMAL_PLACES = 2

/**
 * Matches a fixed-scale money string with exactly two decimal places and an
 * optional leading minus sign (negative wallet balances are permitted by the
 * schema — domain model §3.2). Example: `"1250.50"`, `"-250.00"`.
 */
export const MONEY_PATTERN = /^-?\d+\.\d{2}$/

/** Canonical zero-money value. */
export const ZERO_MONEY = '0.00'
