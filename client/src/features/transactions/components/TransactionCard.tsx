import { Eye, Edit2, Ban } from 'lucide-react'
import type { Transaction, Wallet } from '@family-finance/shared'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { AmountDisplay } from './AmountDisplay'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { getSubCategoryName, TRANSACTION_TYPE_CONFIG } from '../transaction.constants'

export interface TransactionCardProps {
  transaction: Transaction
  wallets?: Wallet[]
  onView: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onVoid: (transaction: Transaction) => void
}

export function TransactionCard({
  transaction,
  wallets = [],
  onView,
  onEdit,
  onVoid,
}: TransactionCardProps) {
  const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type]
  const Icon = typeConfig.icon
  const isCancelled = transaction.status === TransactionStatus.CANCELLED

  // Resolve wallet name(s)
  const getWalletName = (id?: string) => wallets.find((w) => w.id === id)?.name ?? 'Wallet'

  const walletDisplay =
    transaction.type === TransactionType.TRANSFER
      ? `${getWalletName(transaction.sourceWalletId)} → ${getWalletName(transaction.destinationWalletId)}`
      : getWalletName(transaction.walletId)

  const dateDisplay = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="border-border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
        <div className="flex items-center space-x-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeConfig.color} bg-muted`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {transaction.type === TransactionType.TRANSFER
                ? 'Transfer'
                : getSubCategoryName(transaction.subCategoryId)}
            </p>
            <p className="text-xs text-muted-foreground">{dateDisplay}</p>
          </div>
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span
            className="text-xs text-muted-foreground truncate max-w-[200px]"
            title={walletDisplay}
          >
            {walletDisplay}
          </span>
          <AmountDisplay
            amount={transaction.amount}
            currency={transaction.currency}
            type={transaction.type}
            status={transaction.status}
            className="text-lg"
          />
        </div>

        {transaction.notes ? (
          <p
            className="text-xs text-muted-foreground italic line-clamp-1"
            title={transaction.notes}
          >
            "{transaction.notes}"
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-muted/20">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {transaction.type}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onView(transaction)}
            title="View Details"
            aria-label="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {!isCancelled ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onEdit(transaction)}
                title="Edit Transaction"
                aria-label="Edit Transaction"
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onVoid(transaction)}
                title="Void Transaction"
                aria-label="Void Transaction"
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  )
}
