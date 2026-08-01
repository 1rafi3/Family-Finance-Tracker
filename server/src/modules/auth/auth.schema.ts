import { z } from 'zod'
import { emailSchema, loginSchema, nameSchema, passwordSchema } from '@family-finance/shared'
import type { LoginInput } from '@family-finance/shared'

export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .strict()

export type RegisterInput = z.infer<typeof registerSchema>

export { loginSchema }
export type { LoginInput }
