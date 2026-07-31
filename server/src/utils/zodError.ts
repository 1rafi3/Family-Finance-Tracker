import type { ZodError, ZodIssue } from 'zod'
import type { FieldError } from '../types/api.js'

function codeForIssue(issue: ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined' ? 'REQUIRED' : 'TYPE_MISMATCH'
    case 'invalid_string':
      return issue.validation === 'email' ? 'EMAIL_INVALID' : 'INVALID_STRING'
    case 'too_small':
      return issue.type === 'string' ? 'STRING_MIN' : issue.type === 'array' ? 'ARRAY_MIN' : 'MIN'
    case 'too_big':
      return issue.type === 'string' ? 'STRING_MAX' : issue.type === 'array' ? 'ARRAY_MAX' : 'MAX'
    case 'invalid_enum_value':
      return 'ENUM_INVALID'
    case 'unrecognized_keys':
      return 'UNKNOWN_FIELD'
    case 'custom':
      return 'VALIDATION_FAILED'
    default:
      return issue.code.toUpperCase()
  }
}

/** Maps a Zod error to the field-scoped error shape defined in the API contract (§5.3). */
export function formatZodIssues(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: codeForIssue(issue),
    message: issue.message,
  }))
}
