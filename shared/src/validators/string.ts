import { z } from 'zod'
import {
  COUNTERPARTY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NOTES_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TAG_NAME_MAX_LENGTH,
  WALLET_TYPE_MAX_LENGTH,
  WIDGET_KEY_MAX_LENGTH,
  WIDGET_TITLE_MAX_LENGTH,
} from '../constants/index.js'

/** Validates a general name field (1–50 chars, trimmed). */
export const nameSchema = z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH)

/** Validates a tag name (1–30 chars, trimmed). */
export const tagNameSchema = z.string().trim().min(NAME_MIN_LENGTH).max(TAG_NAME_MAX_LENGTH)

/** Validates a loan counterparty name (1–100 chars, trimmed). */
export const counterpartyNameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH)
  .max(COUNTERPARTY_NAME_MAX_LENGTH)

/** Validates optional free-text notes (max 500 chars, trimmed). */
export const notesSchema = z.string().trim().max(NOTES_MAX_LENGTH)

/** Validates an email address: trimmed, lowercased, well-formed, max 254 chars. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Must be a valid email')
  .max(EMAIL_MAX_LENGTH)

/** Validates a password (8–72 chars; 72 is the bcrypt input limit). */
export const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH)

/** Validates a free-form wallet type string (non-empty, max 50 chars). */
export const walletTypeSchema = z.string().trim().min(NAME_MIN_LENGTH).max(WALLET_TYPE_MAX_LENGTH)

/** Validates an ISO 4217 currency code, e.g. `BDT`. */
export const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Must be a valid ISO 4217 currency code')

/** Validates a dashboard widget key (1–60 chars). */
export const widgetKeySchema = z.string().trim().min(NAME_MIN_LENGTH).max(WIDGET_KEY_MAX_LENGTH)

/** Validates a dashboard widget title (1–100 chars, trimmed). */
export const widgetTitleSchema = z.string().trim().min(NAME_MIN_LENGTH).max(WIDGET_TITLE_MAX_LENGTH)
