/**
 * Role of a user within the household.
 * - `ADMIN`: full control — member management, SuperCategory creation, dashboard layout.
 * - `MEMBER`: standard household member.
 */
export const UserRole = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const

/** Union type of all {@link UserRole} values. */
export type UserRole = (typeof UserRole)[keyof typeof UserRole]
