import type { Wallet } from '@family-finance/shared'
import { Dialog } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/useAuth'
import { useCreateTransaction } from '../useTransactions'
import { TransactionForm, type TransactionFormData } from './TransactionForm'

export interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  wallets?: Wallet[]
}

export function CreateTransactionModal({ isOpen, onClose, wallets = [] }: CreateTransactionModalProps) {
  const createMutation = useCreateTransaction()
  const { user } = useAuth()

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await createMutation.mutateAsync({
        type: data.type,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        ownerId: user?.id,
        walletId: data.type !== 'TRANSFER' ? data.walletId : undefined,
        sourceWalletId: data.type === 'TRANSFER' ? data.sourceWalletId : undefined,
        destinationWalletId: data.type === 'TRANSFER' ? data.destinationWalletId : undefined,
        subCategoryId: data.type !== 'TRANSFER' ? data.subCategoryId : undefined,
        notes: data.notes || undefined,
        date: new Date(data.date).toISOString(),
      })
      onClose()
    } catch {
      // Error handled by hook toast
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record New Transaction"
      description="Add an income, expense, or wallet transfer to your ledger."
    >
      <TransactionForm
        wallets={wallets}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={createMutation.isPending}
        submitText="Record Transaction"
      />
    </Dialog>
  )
}
