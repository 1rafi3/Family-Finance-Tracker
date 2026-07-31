import { MONEY_PATTERN } from '../constants/index.js'
import type { Money } from '../types/index.js'

/**
 * Returns `true` when the value is a fixed-scale money string (two decimal
 * places, optional leading minus).
 */
export function isValidMoneyString(value: string): boolean {
  return MONEY_PATTERN.test(value)
}

/**
 * Formats a finite number as a fixed two-decimal money string.
 * Intended for display/input normalization of small values; financial
 * arithmetic must never run on raw JavaScript floating point (domain §2.6).
 *
 * @throws RangeError when the input is not finite.
 */
export function toMoneyString(value: number): Money {
  if (!Number.isFinite(value)) {
    throw new RangeError('Cannot format a non-finite number as money')
  }
  return value.toFixed(2)
}
