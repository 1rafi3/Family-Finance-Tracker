import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeftRight, ArrowRight, Plus } from 'lucide-react'
import { TransactionType } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AmountDisplay } from '@/features/transactions/components/AmountDisplay'
import { CreateTransactionModal } from '@/features/transactions/components/CreateTransactionModal'
import { TransactionStatusBadge } from '@/features/transactions/components/TransactionStatusBadge'
import { getSubCategoryName, TRANSACTION_TYPE_CONFIG } from '@/features/transactions/transaction.constants'
import { useTransactions } from '@/features/transactions/useTransactions'
import { useWallets } from '@/features/wallets/useWallets'

export function RecentTransactionsWidget() {
  const { data, isLoading } = useTransactions({ limit: 5 })
  const { data: walletsData } = useWallets()
  const wallets = walletsData ?? []

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const transactions = data?.data ?? []

  const getWalletName = (id?: string) => wallets.find((w) => w.id === id)?.name ?? 'Wallet'

  return (
    <>
      <Card className="h-full flex flex-col justify-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="min-w-0 pr-2">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <CardDescription className="text-xs">Latest income, expenses &amp; transfers</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record</span>
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-1">
          {isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-lg bg-muted/20 p-6 my-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No recent transactions</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Log income, expenses, or transfers to build your household activity timeline.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Add Transaction</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const typeConfig = TRANSACTION_TYPE_CONFIG[tx.type]
                const Icon = typeConfig.icon

                const walletDisplay =
                  tx.type === TransactionType.TRANSFER
                    ? `${getWalletName(tx.sourceWalletId)} → ${getWalletName(tx.destinationWalletId)}`
                    : getWalletName(tx.walletId)

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors gap-3 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`rounded-md border border-border p-1.5 bg-muted/40 shrink-0 ${typeConfig.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium text-foreground leading-snug"
                          title={
                            tx.type === TransactionType.TRANSFER
                              ? 'Transfer'
                              : getSubCategoryName(tx.subCategoryId)
                          }
                        >
                          {tx.type === TransactionType.TRANSFER
                            ? 'Transfer'
                            : getSubCategoryName(tx.subCategoryId)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={walletDisplay}>
                          {walletDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <AmountDisplay
                        amount={tx.amount}
                        currency={tx.currency}
                        type={tx.type}
                        status={tx.status}
                        className="text-sm font-mono"
                      />
                      <div>
                        <TransactionStatusBadge status={tx.status} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {transactions.length > 0 ? (
            <div className="pt-2 border-t border-border">
              <Link
                to="/transactions"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>View all transactions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CreateTransactionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        wallets={wallets}
      />
    </>
  )
}
