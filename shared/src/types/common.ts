/** MongoDB `ObjectId` serialized as a 24-char hex string across the API. */
export type Id = string

/** ISO 8601 UTC timestamp string, e.g. `"2026-07-31T12:34:56.789Z"`. */
export type ISODateString = string

/**
 * Fixed-scale monetary value serialized as a string with exactly two decimal
 * places, e.g. `"1250.50"`. May carry a leading `-` for negative balances
 * (domain model §2.6, §3.2).
 */
export type Money = string
