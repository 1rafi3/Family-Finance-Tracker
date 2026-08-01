export const TRANSACTION_ERROR_MESSAGES = {
  NOT_FOUND: 'Transaction not found',
  OWNER_ONLY: 'You can only manage your own transactions',
  WALLET_NOT_FOUND: 'Wallet not found',
  WALLET_ARCHIVED: 'Wallet is archived',
  WALLET_FORBIDDEN: 'You do not have access to this wallet',
  CANCELLED: 'Cancelled transactions cannot be modified',
  DATE_RANGE_INVALID: 'dateFrom must be on or before dateTo',
  INVALID_CURSOR: 'Invalid pagination cursor',
} as const
