import type { User } from '@family-finance/shared'

/** Payload of a successful login/registration session (contract §8.1). */
export interface AuthenticatedSession {
  accessToken: string
  user: User
}
