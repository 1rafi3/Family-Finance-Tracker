import { z } from 'zod'
import { emailSchema, passwordSchema } from '../validators/index.js'

/** Validates a login request body (`email`, `password`). */
export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict()

/** Input type of {@link loginSchema}. */
export type LoginInput = z.input<typeof loginSchema>

/** Validates a password-change request body (`currentPassword`, `newPassword`). */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .strict()

/** Input type of {@link changePasswordSchema}. */
export type ChangePasswordInput = z.input<typeof changePasswordSchema>
