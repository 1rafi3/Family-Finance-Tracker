/** Matches a MongoDB ObjectId: exactly 24 hex characters. */
export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

/** Minimum length for short name fields (person, wallet, category names). */
export const NAME_MIN_LENGTH = 1

/** Maximum length for person, wallet, and category names. */
export const NAME_MAX_LENGTH = 50

/** Maximum length for tag names. */
export const TAG_NAME_MAX_LENGTH = 30

/** Maximum length for loan counterparty names. */
export const COUNTERPARTY_NAME_MAX_LENGTH = 100

/** Maximum length for free-text notes. */
export const NOTES_MAX_LENGTH = 500

/** Maximum length for email addresses (RFC 5321 practical limit). */
export const EMAIL_MAX_LENGTH = 254

/** Minimum password length. */
export const PASSWORD_MIN_LENGTH = 8

/** Maximum password length (bcrypt 72-byte input limit). */
export const PASSWORD_MAX_LENGTH = 72

/** Minimum interest rate percentage. */
export const INTEREST_RATE_MIN = 0

/** Maximum interest rate percentage. */
export const INTEREST_RATE_MAX = 100

/** Minimum loan term in months. */
export const TERM_MONTHS_MIN = 1

/** Minimum `periodMonth` value (January). */
export const PERIOD_MONTH_MIN = 1

/** Maximum `periodMonth` value (December). */
export const PERIOD_MONTH_MAX = 12

/** Minimum accepted `periodYear` value. */
export const PERIOD_YEAR_MIN = 2000

/** Maximum accepted `periodYear` value. */
export const PERIOD_YEAR_MAX = 2100

/** Maximum length for the free-form wallet type string. */
export const WALLET_TYPE_MAX_LENGTH = 50

/** Maximum number of tags that may be attached to a single transaction. */
export const MAX_TAGS_PER_TRANSACTION = 100

/** Maximum length for a dashboard widget key. */
export const WIDGET_KEY_MAX_LENGTH = 60

/** Maximum length for a dashboard widget title. */
export const WIDGET_TITLE_MAX_LENGTH = 100
