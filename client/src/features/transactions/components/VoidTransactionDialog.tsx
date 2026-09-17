import { AlertTriangle } from 'lucide-react'
import type { Transaction } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { AmountDisplay } from './AmountDisplay'
import { useVoidTransaction } from '../useTransactions'

export interface VoidTransactionDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export function VoidTransactionDialog({ transaction, isOpen, onClose }: VoidTransactionDialogProps) {
  const voidMutation = useVoidTransaction()

  if (!transaction) return null

  const handleConfirm = async () => {
    try {
      await voidMutation.mutateAsync(transaction.id)
      onClose()
    } catch {
      // Error handled by hook toast
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
            <h3 className="text-lg font-semibold text-foreground">Void Transaction</h3>
            <p className="text-sm text-muted-foreground">Cancel transaction and reverse balance effect.</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to void this transaction of{' '}
          <AmountDisplay
            amount={transaction.amount}
            currency={transaction.currency}
            type={transaction.type}
          />
          ? The wallet balances will be automatically restored, and the record will be marked as CANCELLED.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={voidMutation.isPending}>
            Keep Active
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            isLoading={voidMutation.isPending}
          >
            Void Transaction
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
