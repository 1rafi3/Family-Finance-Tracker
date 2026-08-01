import type { User } from '@family-finance/shared'

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user attached by the `authenticate` middleware. */
      user?: User
    }
  }
}

export {}
