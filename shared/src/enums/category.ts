/**
 * Type of a category, fixed at creation and inherited by SubCategories.
 * - `INCOME`: income-side category.
 * - `EXPENSE`: expense-side category.
 */
export const CategoryType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const

/** Union type of all {@link CategoryType} values. */
export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType]
