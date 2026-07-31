import { OBJECT_ID_PATTERN } from '../constants/index.js'

/** Returns `true` when the value is a valid 24-char MongoDB ObjectId. */
export function isValidObjectId(value: string): boolean {
  return OBJECT_ID_PATTERN.test(value)
}
