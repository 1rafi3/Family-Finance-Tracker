import type { Wallet } from '@family-finance/shared'
import { Dialog } from '@/components/ui/dialog'
import { useUpdateWallet } from '../useWallets'
import { WalletForm, type WalletFormData } from './WalletForm'

export interface EditWalletModalProps {
  wallet: Wallet | null
  isOpen: boolean
  onClose: () => void
}

export function EditWalletModal({ wallet, isOpen, onClose }: EditWalletModalProps) {
  const updateMutation = useUpdateWallet()

  if (!wallet) return null

  const handleSubmit = async (data: WalletFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: wallet.id,
        input: {
          name: data.name,
          type: data.type,
          currency: data.currency,
        },
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
      title={`Edit ${wallet.name}`}
      description="Update wallet name, type, or currency. Balance and owner cannot be modified directly."
    >
      <WalletForm
        initialValues={{
          name: wallet.name,
          type: wallet.type,
          currency: wallet.currency,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={updateMutation.isPending}
        submitText="Save Changes"
      />
    </Dialog>
  )
}
