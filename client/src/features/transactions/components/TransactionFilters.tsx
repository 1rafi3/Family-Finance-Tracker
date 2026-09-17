import { Filter, RotateCcw, Search } from 'lucide-react'
import type { Wallet } from '@family-finance/shared'
import { TransactionStatus, TransactionType } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { usePeople } from '@/features/people/usePeople'
import type { TransactionListQuery } from '../transaction.service'

export interface TransactionFiltersProps {
  filters: TransactionListQuery
  onChange: (filters: TransactionListQuery) => void
  onReset: () => void
  wallets?: Wallet[]
}

export function TransactionFilters({
  filters,
  onChange,
  onReset,
  wallets = [],
}: TransactionFiltersProps) {
  const { people } = usePeople()
  const isFiltered = Boolean(
    filters.type ||
      filters.status ||
      filters.walletId ||
      filters.personId ||
      filters.search ||
      filters.dateFrom ||
      filters.dateTo,
  )

  const activeWallets = wallets.filter((w) => !w.isArchived)

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filter Transactions</span>
        </div>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs text-muted-foreground">
            <RotateCcw className="mr-1 h-3 w-3" />
            <span>Reset Filters</span>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search notes..."
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="pl-9"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Transaction Type */}
        <Select
          value={filters.type ?? ''}
          onChange={(e) => onChange({ ...filters, type: e.target.value || undefined })}
        >
          <option value="">All Types</option>
          <option value={TransactionType.INCOME}>Income</option>
          <option value={TransactionType.EXPENSE}>Expense</option>
          <option value={TransactionType.TRANSFER}>Transfer</option>
        </Select>

        {/* Status */}
        <Select
          value={filters.status ?? ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        >
          <option value="">All Statuses</option>
          <option value={TransactionStatus.COMPLETED}>Completed</option>
          <option value={TransactionStatus.PENDING}>Pending</option>
          <option value={TransactionStatus.CANCELLED}>Voided / Cancelled</option>
        </Select>

        {/* Wallet / Account */}
        <Select
          value={filters.walletId ?? ''}
          onChange={(e) => onChange({ ...filters, walletId: e.target.value || undefined })}
        >
          <option value="">All Accounts</option>
          {activeWallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.currency})
            </option>
          ))}
        </Select>

        {/* Spent For / Beneficiary */}
        <Select
          value={filters.personId ?? ''}
          onChange={(e) => onChange({ ...filters, personId: e.target.value || undefined })}
        >
          <option value="">All Beneficiaries</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              Spent for: {p.name} ({p.relationship})
            </option>
          ))}
        </Select>
      </div>

      {/* Date Range Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
        <Input
          type="date"
          label="From Date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
        />
        <Input
          type="date"
          label="To Date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}
