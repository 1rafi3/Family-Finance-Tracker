import type { TransactionStatus } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { TRANSACTION_STATUS_CONFIG } from '../transaction.constants'

export interface TransactionStatusBadgeProps {
  status: TransactionStatus
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const config = TRANSACTION_STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.badgeVariant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  )
}
