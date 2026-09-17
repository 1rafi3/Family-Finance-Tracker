import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Plus, Wallet as WalletIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateWalletModal } from '@/features/wallets/components/CreateWalletModal'
import { formatBalance, getWalletTypeConfig } from '@/features/wallets/wallet.constants'
import { useWallets } from '@/features/wallets/useWallets'

export function WalletSummaryWidget() {
  const { data: wallets, isLoading } = useWallets()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const activeWallets = wallets?.filter((w) => !w.isArchived) ?? []

  // Calculate total balance for BDT active wallets
  const totalBalanceBDT = activeWallets
    .filter((w) => w.currency === 'BDT')
    .reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0)

  return (
    <>
      <Card className="h-full flex flex-col justify-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Wallets Summary</CardTitle>
              {activeWallets.length > 0 ? (
                <Badge variant="secondary" className="shrink-0">{activeWallets.length} Active</Badge>
              ) : null}
            </div>
            <CardDescription className="text-xs">Active accounts & balances</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New</span>
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-1">
          {isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : activeWallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-lg bg-muted/20 p-6 my-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <WalletIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No wallets created yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Add bank accounts, credit cards, or cash wallets to track your balances.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                <span>Create Wallet</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Total Balance Banner */}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-center justify-between min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Combined Active Balance
                  </p>
                  <p
                    className="text-lg sm:text-xl font-bold tracking-tight text-primary truncate font-mono"
                    title={formatBalance(totalBalanceBDT.toFixed(2), 'BDT')}
                  >
                    {formatBalance(totalBalanceBDT.toFixed(2), 'BDT')}
                  </p>
                </div>
              </div>

              {/* Wallet List (up to 4) */}
              <div className="space-y-2">
                {activeWallets.slice(0, 4).map((wallet) => {
                  const typeConfig = getWalletTypeConfig(wallet.type)
                  const Icon = typeConfig.icon
                  return (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors gap-3 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="rounded-md border border-border p-1.5 bg-muted/40 shrink-0">
                          <Icon className={`h-4 w-4 ${typeConfig.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-medium text-foreground leading-snug truncate"
                            title={wallet.name}
                          >
                            {wallet.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{typeConfig.label}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-sm font-semibold text-foreground font-mono"
                          title={formatBalance(wallet.balance, wallet.currency)}
                        >
                          {formatBalance(wallet.balance, wallet.currency)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeWallets.length > 0 ? (
            <div className="pt-2 border-t border-border">
              <Link
                to="/wallets"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>View all wallets ({activeWallets.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CreateWalletModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  )
}
