import { useState } from 'react'
import { PlusCircle, Wallet as WalletIcon } from 'lucide-react'
import type { Wallet } from '@family-finance/shared'
import { Button } from '@/components/ui/button'
import { ArchiveWalletDialog } from './components/ArchiveWalletDialog'
import { CreateWalletModal } from './components/CreateWalletModal'
import { EditWalletModal } from './components/EditWalletModal'
import { EmptyWalletState } from './components/EmptyWalletState'
import { WalletCard } from './components/WalletCard'
import { WalletGridSkeleton } from './components/WalletSkeleton'
import { useWallets } from './useWallets'

export function WalletListPage() {
  const { data: wallets, isLoading, isError, error, refetch } = useWallets()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [archivingWallet, setArchivingWallet] = useState<Wallet | null>(null)

  // Filter out archived wallets for main active list
  const activeWallets = wallets?.filter((w) => !w.isArchived) ?? []
  const archivedWallets = wallets?.filter((w) => w.isArchived) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-primary" />
            <span>Wallets</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage cash, bank accounts, and mobile wallets for your household
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Add Wallet</span>
        </Button>
      </div>

      {/* Content State */}
      {isLoading ? (
        <WalletGridSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
          <p className="font-semibold">Failed to load wallets</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : activeWallets.length === 0 && archivedWallets.length === 0 ? (
        <EmptyWalletState onCreateWallet={() => setIsCreateOpen(true)} />
      ) : (
        <div className="space-y-8">
          {/* Active Wallets Grid */}
          {activeWallets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={(w) => setEditingWallet(w)}
                  onArchive={(w) => setArchivingWallet(w)}
                />
              ))}
            </div>
          ) : (
            <EmptyWalletState onCreateWallet={() => setIsCreateOpen(true)} />
          )}

          {/* Archived Wallets Section */}
          {archivedWallets.length > 0 ? (
            <div className="space-y-3 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Archived Wallets ({archivedWallets.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {archivedWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    onEdit={(w) => setEditingWallet(w)}
                    onArchive={(w) => setArchivingWallet(w)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Modals & Dialogs */}
      <CreateWalletModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <EditWalletModal
        wallet={editingWallet}
        isOpen={Boolean(editingWallet)}
        onClose={() => setEditingWallet(null)}
      />

      <ArchiveWalletDialog
        wallet={archivingWallet}
        isOpen={Boolean(archivingWallet)}
        onClose={() => setArchivingWallet(null)}
      />
    </div>
  )
}

export default WalletListPage
