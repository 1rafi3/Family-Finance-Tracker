import { TransactionStatus, TransactionType } from '@family-finance/shared'
import { cn } from '@/lib/utils'
import { formatBalance } from '@/features/wallets/wallet.constants'
import { TRANSACTION_TYPE_CONFIG } from '../transaction.constants'

export interface AmountDisplayProps {
  amount: string
  currency: string
  type: TransactionType
  status?: TransactionStatus
  className?: string
}

export function AmountDisplay({
  amount,
  currency,
  type,
  status,
  className,
}: AmountDisplayProps) {
  const config = TRANSACTION_TYPE_CONFIG[type]
  const isCancelled = status === TransactionStatus.CANCELLED

  const formatted = formatBalance(amount, currency)
  const sign = config.amountSign

  return (
    <span
      className={cn(
        'font-mono tracking-tight font-semibold',
        isCancelled ? 'line-through text-muted-foreground opacity-60' : config.amountColor,
        className,
      )}
    >
      {sign}
      {formatted}
    </span>
  )
}
