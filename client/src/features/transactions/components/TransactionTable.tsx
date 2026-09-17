import { Eye, Edit2, Ban, User } from 'lucide-react'
import type { Transaction, Wallet } from '@family-finance/shared'
import { TransactionStatus, TransactionType } from '@family-finance/shared'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePeople } from '@/features/people/usePeople'
import { AmountDisplay } from './AmountDisplay'
import { TransactionStatusBadge } from './TransactionStatusBadge'
import { getSubCategoryName, TRANSACTION_TYPE_CONFIG } from '../transaction.constants'

export interface TransactionTableProps {
  transactions: Transaction[]
  wallets?: Wallet[]
  onView: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onVoid: (transaction: Transaction) => void
}

export function TransactionTable({
  transactions,
  wallets = [],
  onView,
  onEdit,
  onVoid,
}: TransactionTableProps) {
  const { people } = usePeople()
  const getWalletName = (id?: string) => wallets.find((w) => w.id === id)?.name ?? 'Account'
  const getPerson = (id?: string) => people.find((p) => p.id === id)

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-[0_1px_4px_0_rgb(0_0_0/0.04)]">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
          <tr>
            <th className="px-4 py-3">Type / Category</th>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 text-xs">
          {transactions.map((tx) => {
            const typeConfig = TRANSACTION_TYPE_CONFIG[tx.type]
            const Icon = typeConfig.icon
            const isCancelled = tx.status === TransactionStatus.CANCELLED
            const person = getPerson(tx.personId)

            const walletDisplay =
              tx.type === TransactionType.TRANSFER
                ? `${getWalletName(tx.sourceWalletId)} → ${getWalletName(tx.destinationWalletId)}`
                : getWalletName(tx.walletId)

            const dateDisplay = new Date(tx.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })

            return (
              <tr key={tx.id} className="hover:bg-muted/30 transition-colors duration-150">
                {/* Type / Category */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeConfig.color} bg-muted/60`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground leading-none">
                          {tx.type === TransactionType.TRANSFER
                            ? 'Transfer'
                            : getSubCategoryName(tx.subCategoryId)}
                        </p>
                        {person ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1 font-normal text-muted-foreground border-border/60"
                            title={`Spent for ${person.name} (${person.relationship})`}
                          >
                            <User className="h-2.5 w-2.5 mr-0.5 text-primary" />
                            {person.name}
                          </Badge>
                        ) : null}
                      </div>

                      {tx.notes ? (
                        <p
                          className="text-[11px] text-muted-foreground mt-0.5 max-w-xs truncate"
                          title={tx.notes}
                        >
                          {tx.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>

                {/* Account */}
                <td
                  className="px-4 py-3 text-muted-foreground font-medium truncate max-w-[200px]"
                  title={walletDisplay}
                >
                  {walletDisplay}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                  {dateDisplay}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <TransactionStatusBadge status={tx.status} />
                </td>

                {/* Amount */}
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  <AmountDisplay amount={tx.amount} currency={tx.currency} type={tx.type} status={tx.status} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onView(tx)}
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    {!isCancelled ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onEdit(tx)}
                          title="Edit Transaction"
                          aria-label="Edit Transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onVoid(tx)}
                          title="Void Transaction"
                          aria-label="Void Transaction"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
