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

function toCents(money: Money): number {
  const negative = money.startsWith('-')
  const [whole, fraction] = (negative ? money.slice(1) : money).split('.')
  const cents = Number(whole) * 100 + Number(fraction ?? '0')
  return negative ? -cents : cents
}

function fromCents(cents: number): Money {
  const negative = cents < 0
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const fraction = String(abs % 100).padStart(2, '0')
  return `${negative ? '-' : ''}${whole}.${fraction}`
}

/**
 * Exact decimal-safe addition of two money strings. Operates on integer cents
 * to avoid floating-point error (domain §2.6). Result is a fixed two-decimal
 * money string.
 */
export function addMoney(a: Money, b: Money): Money {
  return fromCents(toCents(a) + toCents(b))
}

/** Exact decimal-safe subtraction of two money strings (`a - b`). */
export function subtractMoney(a: Money, b: Money): Money {
  return fromCents(toCents(a) - toCents(b))
}
