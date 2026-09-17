import type { Transaction, Wallet } from '@family-finance/shared'
import { TransactionType } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Sheet } from '@/components/ui/sheet'
import { AmountDisplay } from './AmountDisplay'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { getSubCategoryName, TRANSACTION_TYPE_CONFIG } from '../transaction.constants'

export interface TransactionDetailDrawerProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  wallets?: Wallet[]
}

export function TransactionDetailDrawer({
  transaction,
  isOpen,
  onClose,
  wallets = [],
}: TransactionDetailDrawerProps) {
  if (!transaction) return null

  const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type]
  const Icon = typeConfig.icon

  const getWalletName = (id?: string) => wallets.find((w) => w.id === id)?.name ?? 'Unknown Wallet'

  const dateDisplay = new Date(transaction.date).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  })
  const createdAtDisplay = new Date(transaction.createdAt).toLocaleString()

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-6 pt-2">
        {/* Header Hero */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-muted/20 text-center space-y-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${typeConfig.color} bg-muted`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <AmountDisplay
              amount={transaction.amount}
              currency={transaction.currency}
              type={transaction.type}
              status={transaction.status}
              className="text-3xl font-bold"
            />
            <p className="text-xs text-muted-foreground mt-1">{dateDisplay}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{transaction.type}</Badge>
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm divide-y divide-border">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs font-medium text-foreground">{transaction.id}</span>
          </div>

          {transaction.type === TransactionType.TRANSFER ? (
            <>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Source Wallet</span>
                <span className="font-semibold text-foreground">
                  {getWalletName(transaction.sourceWalletId)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Destination Wallet</span>
                <span className="font-semibold text-foreground">
                  {getWalletName(transaction.destinationWalletId)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-semibold text-foreground">
                  {getWalletName(transaction.walletId)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">
                  {getSubCategoryName(transaction.subCategoryId)}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium text-foreground">{transaction.currency}</span>
          </div>

          {transaction.notes ? (
            <div className="py-2 space-y-1">
              <span className="text-muted-foreground block">Notes</span>
              <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-md italic">
                "{transaction.notes}"
              </p>
            </div>
          ) : null}

          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Recorded At</span>
            <span className="text-xs text-muted-foreground">{createdAtDisplay}</span>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
