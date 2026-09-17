import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { TransactionStatus, TransactionType } from '@family-finance/shared'

export interface TransactionTypeConfig {
  label: string
  icon: LucideIcon
  color: string
  badgeVariant: 'success' | 'destructive' | 'secondary' | 'outline' | 'default'
  amountSign: string
  amountColor: string
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  [TransactionType.INCOME]: {
    label: 'Income',
    icon: ArrowUpRight,
    color: 'text-success',
    badgeVariant: 'success',
    amountSign: '+',
    amountColor: 'text-success font-semibold',
  },
  [TransactionType.EXPENSE]: {
    label: 'Expense',
    icon: ArrowDownRight,
    color: 'text-destructive',
    badgeVariant: 'destructive',
    amountSign: '-',
    amountColor: 'text-destructive font-semibold',
  },
  [TransactionType.TRANSFER]: {
    label: 'Transfer',
    icon: ArrowLeftRight,
    color: 'text-primary',
    badgeVariant: 'secondary',
    amountSign: '',
    amountColor: 'text-primary font-semibold',
  },
}

export interface TransactionStatusConfig {
  label: string
  icon: LucideIcon
  color: string
  badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary'
}

export const TRANSACTION_STATUS_CONFIG: Record<TransactionStatus, TransactionStatusConfig> = {
  [TransactionStatus.COMPLETED]: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-success',
    badgeVariant: 'success',
  },
  [TransactionStatus.PENDING]: {
    label: 'Pending',
    icon: Clock,
    color: 'text-warning',
    badgeVariant: 'warning',
  },
  [TransactionStatus.CANCELLED]: {
    label: 'Voided',
    icon: XCircle,
    color: 'text-destructive',
    badgeVariant: 'destructive',
  },
}

// Sample fallback category mappings (since Categories CRUD is in a future phase)
export const DEFAULT_SUBCATEGORIES = [
  { id: '600000000000000000000001', name: 'Salary / Income', type: TransactionType.INCOME },
  { id: '600000000000000000000002', name: 'Freelance & Business', type: TransactionType.INCOME },
  { id: '600000000000000000000003', name: 'Food & Groceries', type: TransactionType.EXPENSE },
  { id: '600000000000000000000004', name: 'Utilities & Bills', type: TransactionType.EXPENSE },
  { id: '600000000000000000000005', name: 'Rent & Housing', type: TransactionType.EXPENSE },
  { id: '600000000000000000000006', name: 'Shopping & Apparel', type: TransactionType.EXPENSE },
  { id: '600000000000000000000007', name: 'Transportation', type: TransactionType.EXPENSE },
  { id: '600000000000000000000008', name: 'Entertainment & Leisure', type: TransactionType.EXPENSE },
  { id: '600000000000000000000009', name: 'General & Miscellaneous', type: TransactionType.EXPENSE },
]

export function getSubCategoryName(subCategoryId?: string): string {
  if (!subCategoryId) return 'General'
  const match = DEFAULT_SUBCATEGORIES.find((cat) => cat.id === subCategoryId)
  return match?.name ?? 'General'
}
