import { Dialog } from '@/components/ui/dialog'
import { useCreateWallet } from '../useWallets'
import { WalletForm, type WalletFormData } from './WalletForm'

export interface CreateWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWalletModal({ isOpen, onClose }: CreateWalletModalProps) {
  const createMutation = useCreateWallet()

  const handleSubmit = async (data: WalletFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        type: data.type,
        currency: data.currency,
      })
      onClose()
    } catch {
      // Error handling managed by hook toast
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Wallet"
      description="Add a cash, bank account, or mobile wallet to track your finances."
    >
      <WalletForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={createMutation.isPending}
        submitText="Create Wallet"
      />
    </Dialog>
  )
}
