import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  DEFAULT_CURRENCY,
  TransactionStatus,
  TransactionType,
  transactionCreateSchema,
  type Wallet,
} from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/useAuth'
import { usePeople } from '@/features/people/usePeople'
import { DEFAULT_SUBCATEGORIES } from '../transaction.constants'

export interface TransactionFormData {
  type: TransactionType
  status: TransactionStatus
  amount: string
  currency: string
  walletId?: string
  sourceWalletId?: string
  destinationWalletId?: string
  subCategoryId?: string
  personId?: string
  notes?: string
  date: string
}

export interface TransactionFormProps {
  initialValues?: Partial<TransactionFormData>
  wallets?: Wallet[]
  onSubmit: (data: TransactionFormData) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  submitText?: string
}

export function TransactionForm({
  initialValues,
  wallets = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = 'Save Transaction',
}: TransactionFormProps) {
  const { user } = useAuth()
  const { people } = usePeople()
  const activeWallets = wallets.filter((w) => !w.isArchived)
  const activePeople = people.filter((p) => !p.isArchived)
  const defaultWalletId = activeWallets[0]?.id ?? ''

  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialValues?.type ?? TransactionType.EXPENSE,
  )
  const [formError, setFormError] = useState<string | null>(null)

  const defaultDate = initialValues?.date
    ? new Date(initialValues.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      type: selectedType,
      status: initialValues?.status ?? TransactionStatus.COMPLETED,
      amount: initialValues?.amount ?? '',
      currency: initialValues?.currency ?? DEFAULT_CURRENCY,
      walletId: initialValues?.walletId ?? defaultWalletId,
      sourceWalletId: initialValues?.sourceWalletId ?? defaultWalletId,
      destinationWalletId: initialValues?.destinationWalletId ?? activeWallets[1]?.id ?? '',
      subCategoryId: initialValues?.subCategoryId ?? DEFAULT_SUBCATEGORIES[2].id,
      personId: initialValues?.personId ?? '',
      notes: initialValues?.notes ?? '',
      date: defaultDate,
    },
  })

  const sourceWalletId = watch('sourceWalletId')

  const handleTypeChange = (newType: TransactionType) => {
    setSelectedType(newType)
    setValue('type', newType)
    setFormError(null)
  }

  const handleFormSubmit = (data: TransactionFormData) => {
    setFormError(null)

    if (!user?.id) {
      setFormError('User session invalid. Please log in again.')
      return
    }

    // Normalize amount to 2 decimal places if number provided (e.g. 50 -> "50.00")
    let normalizedAmount = data.amount.trim()
    if (/^\d+(\.\d+)?$/.test(normalizedAmount)) {
      normalizedAmount = parseFloat(normalizedAmount).toFixed(2)
    }

    const isoDate = new Date(data.date).toISOString()

    const payload: Record<string, unknown> = {
      type: selectedType,
      status: data.status,
      amount: normalizedAmount,
      currency: data.currency,
      date: isoDate,
      ownerId: user.id,
      tagIds: [],
    }

    if (data.notes?.trim()) {
      payload.notes = data.notes.trim()
    }

    if (data.personId) {
      payload.personId = data.personId
    }

    if (selectedType === TransactionType.TRANSFER) {
      if (!data.sourceWalletId) {
        setFormError('Source account is required')
        return
      }
      if (!data.destinationWalletId) {
        setFormError('Destination account is required')
        return
      }
      if (data.sourceWalletId === data.destinationWalletId) {
        setFormError('Source & Destination accounts must differ')
        return
      }
      payload.sourceWalletId = data.sourceWalletId
      payload.destinationWalletId = data.destinationWalletId
    } else {
      if (!data.walletId) {
        setFormError('Target account is required')
        return
      }
      if (!data.subCategoryId) {
        setFormError('Category is required')
        return
      }
      payload.walletId = data.walletId
      payload.subCategoryId = data.subCategoryId
    }

    // Run shared Zod schema refinement check
    const parseResult = transactionCreateSchema.safeParse(payload)
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]
      setFormError(issue?.message || 'Invalid transaction inputs')
      return
    }

    const cleanedFormData: TransactionFormData = {
      type: selectedType,
      status: data.status,
      amount: normalizedAmount,
      currency: data.currency,
      date: data.date,
      personId: data.personId || undefined,
      notes: data.notes?.trim() || undefined,
      ...(selectedType === TransactionType.TRANSFER
        ? {
            sourceWalletId: data.sourceWalletId,
            destinationWalletId: data.destinationWalletId,
          }
        : {
            walletId: data.walletId,
            subCategoryId: data.subCategoryId,
          }),
    }

    void onSubmit(cleanedFormData)
  }

  // Filter subcategories by type
  const availableCategories = DEFAULT_SUBCATEGORIES.filter((c) => c.type === selectedType)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {formError ? (
        <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive font-medium border border-destructive/20">
          {formError}
        </div>
      ) : null}

      {/* Transaction Type Selector Pills */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">Transaction Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { type: TransactionType.EXPENSE, label: 'Expense' },
              { type: TransactionType.INCOME, label: 'Income' },
              { type: TransactionType.TRANSFER, label: 'Transfer' },
            ] as const
          ).map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleTypeChange(item.type)}
              className={`py-2 px-3 rounded-md text-xs font-semibold border transition-all ${
                selectedType === item.type
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-input bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Dependent Fields */}
      {selectedType === TransactionType.INCOME || selectedType === TransactionType.EXPENSE ? (
        <>
          <Select
            label="Target Account"
            error={errors.walletId?.message}
            {...register('walletId', { required: 'Account is required' })}
          >
            {activeWallets.length === 0 ? (
              <option value="">No active accounts available</option>
            ) : (
              activeWallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currency}) — Balance: {w.balance}
                </option>
              ))
            )}
          </Select>

          <Select
            label="Category"
            error={errors.subCategoryId?.message}
            {...register('subCategoryId', { required: 'Category is required' })}
          >
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          {/* Spent For / Person Selector (especially for EXPENSE) */}
          {selectedType === TransactionType.EXPENSE ? (
            <Select label="Spent For / Beneficiary" {...register('personId')}>
              <option value="">Myself (Personal Expense)</option>
              {activePeople.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship})
                </option>
              ))}
            </Select>
          ) : null}
        </>
      ) : (
        /* Transfer Fields */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="From Account (Source)"
            error={errors.sourceWalletId?.message}
            {...register('sourceWalletId', { required: 'Source account is required' })}
          >
            {activeWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.balance})
              </option>
            ))}
          </Select>

          <Select
            label="To Account (Destination)"
            error={errors.destinationWalletId?.message}
            {...register('destinationWalletId', {
              required: 'Destination account is required',
              validate: (val) => val !== sourceWalletId || 'Source & Destination accounts must differ',
            })}
          >
            {activeWallets.map((w) => (
              <option key={w.id} value={w.id} disabled={w.id === sourceWalletId}>
                {w.name} ({w.balance}) {w.id === sourceWalletId ? '(Source)' : ''}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Amount & Date Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Amount"
          type="text"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Must be a valid positive amount (e.g. 500.00)',
            },
          })}
        />

        <Input
          type="date"
          label="Date"
          error={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />
      </div>

      {/* Status & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="Status" {...register('status')}>
          <option value={TransactionStatus.COMPLETED}>Completed (Effective immediately)</option>
          <option value={TransactionStatus.PENDING}>Pending</option>
        </Select>

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Weekly grocery shopping"
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  )
}
