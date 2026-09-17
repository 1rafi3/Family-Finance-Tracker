import { AlertTriangle } from 'lucide-react'
import type { Wallet } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useArchiveWallet } from '../useWallets'

export interface ArchiveWalletDialogProps {
  wallet: Wallet | null
  isOpen: boolean
  onClose: () => void
}

export function ArchiveWalletDialog({ wallet, isOpen, onClose }: ArchiveWalletDialogProps) {
  const archiveMutation = useArchiveWallet()

  if (!wallet) return null

  const handleConfirm = async () => {
    try {
      await archiveMutation.mutateAsync(wallet.id)
      onClose()
    } catch {
      // Error handling managed by hook toast
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-destructive">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Archive Wallet</h3>
            <p className="text-sm text-muted-foreground">
              This action will soft-delete the wallet.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to archive{' '}
          <strong className="text-foreground">{wallet.name}</strong>? It will be removed from your
          active wallets list and cannot be used for new transactions.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={archiveMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            isLoading={archiveMutation.isPending}
          >
            Archive Wallet
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
