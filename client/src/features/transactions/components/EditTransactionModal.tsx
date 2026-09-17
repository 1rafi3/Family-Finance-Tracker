import type { Transaction, Wallet } from '@family-finance/shared'
import { Dialog } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/useAuth'
import { useUpdateTransaction } from '../useTransactions'
import { TransactionForm, type TransactionFormData } from './TransactionForm'

export interface EditTransactionModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  wallets?: Wallet[]
}

export function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  wallets = [],
}: EditTransactionModalProps) {
  const updateMutation = useUpdateTransaction()
  const { user } = useAuth()

  if (!transaction) return null

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        input: {
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
        },
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
      title="Edit Transaction"
      description="Update transaction details. Balance adjustments will update automatically."
    >
      <TransactionForm
        initialValues={{
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          walletId: transaction.walletId,
          sourceWalletId: transaction.sourceWalletId,
          destinationWalletId: transaction.destinationWalletId,
          subCategoryId: transaction.subCategoryId,
          notes: transaction.notes,
          date: transaction.date,
        }}
        wallets={wallets}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={updateMutation.isPending}
        submitText="Save Changes"
      />
    </Dialog>
  )
}
