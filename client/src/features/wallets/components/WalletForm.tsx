import { useForm } from 'react-hook-form'
import {
  DEFAULT_CURRENCY,
  DEFAULT_WALLET_TYPE,
  SUPPORTED_CURRENCIES,
  walletCreateSchema,
} from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { WALLET_TYPE_OPTIONS } from '../wallet.constants'

export interface WalletFormData {
  name: string
  type: string
  currency: string
}

export interface WalletFormProps {
  initialValues?: Partial<WalletFormData>
  onSubmit: (data: WalletFormData) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  submitText?: string
}

export function WalletForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = 'Save Wallet',
}: WalletFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalletFormData>({
    defaultValues: {
      name: initialValues?.name ?? '',
      type: initialValues?.type ?? DEFAULT_WALLET_TYPE,
      currency: initialValues?.currency ?? DEFAULT_CURRENCY,
    },
  })

  const handleFormSubmit = (data: WalletFormData) => {
    // Validate with shared Zod schema
    const parseResult = walletCreateSchema.safeParse({
      ownerId: '000000000000000000000000', // Dummy 24-char ObjectId for client-side schema check
      ...data,
    })

    if (!parseResult.success) {
      return
    }

    void onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Wallet Name"
        placeholder="e.g. Personal Cash, City Bank, bKash Main"
        error={errors.name?.message}
        {...register('name', {
          required: 'Wallet name is required',
          minLength: { value: 1, message: 'Name must not be empty' },
          maxLength: { value: 50, message: 'Name must be 50 characters or less' },
        })}
      />

      <Select
        label="Wallet Type"
        error={errors.type?.message}
        {...register('type', { required: 'Wallet type is required' })}
      >
        {WALLET_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <Select
        label="Currency"
        error={errors.currency?.message}
        {...register('currency', { required: 'Currency is required' })}
      >
        {SUPPORTED_CURRENCIES.map((curr) => (
          <option key={curr} value={curr}>
            {curr}
          </option>
        ))}
      </Select>

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
