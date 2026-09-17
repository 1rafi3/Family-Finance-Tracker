import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from '../validators/index.js'

/** Validates a login request body (`email`, `password`). */
export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict()

/** Input type of {@link loginSchema}. */
export type LoginInput = z.input<typeof loginSchema>

/** Validates a register request body (`firstName`, `lastName`, `email`, `password`). */
export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .strict()

/** Input type of {@link registerSchema}. */
export type RegisterInput = z.input<typeof registerSchema>

/** Validates a password-change request body (`currentPassword`, `newPassword`). */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .strict()

/** Input type of {@link changePasswordSchema}. */
export type ChangePasswordInput = z.input<typeof changePasswordSchema>
