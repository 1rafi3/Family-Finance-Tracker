export const AUTH_ERROR_MESSAGES = {
  /** Generic message used for both unknown email and wrong password. */
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'An account with this email already exists',
  AUTH_REQUIRED: 'Authentication required',
  TOKEN_INVALID: 'Invalid or expired token',
} as const
