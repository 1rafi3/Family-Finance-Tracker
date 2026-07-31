import { z } from 'zod'
import { DEFAULT_USER_ROLE } from '../constants/index.js'
import { UserRole } from '../enums/index.js'
import type { User } from '../types/index.js'
import {
  dateSchema,
  emailSchema,
  idSchema,
  nameSchema,
  passwordSchema,
} from '../validators/index.js'

/**
 * Validates creation of a user. `password` is the plaintext input; only its
 * bcrypt hash is ever stored server-side.
 */
export const userCreateSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.nativeEnum(UserRole).default(DEFAULT_USER_ROLE),
  })
  .strict()

/** Input type of {@link userCreateSchema}. */
export type UserCreateInput = z.input<typeof userCreateSchema>

/**
 * Validates an update to a user. Password changes go through
 * `changePasswordSchema`, not this schema.
 */
export const userUpdateSchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    email: emailSchema.optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

/** Input type of {@link userUpdateSchema}. */
export type UserUpdateInput = z.input<typeof userUpdateSchema>

/** Validates a `User` resource (public shape, without `passwordHash`). */
export const userSchema: z.ZodType<User> = z.object({
  id: idSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  lastLoginAt: dateSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  createdBy: idSchema.optional(),
  updatedBy: idSchema.optional(),
})
