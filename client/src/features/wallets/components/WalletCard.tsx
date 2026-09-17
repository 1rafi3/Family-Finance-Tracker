import { Archive, Edit2 } from 'lucide-react'
import type { Wallet } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBalance, getWalletTypeConfig } from '../wallet.constants'

export interface WalletCardProps {
  wallet: Wallet
  onEdit: (wallet: Wallet) => void
  onArchive: (wallet: Wallet) => void
}

export function WalletCard({ wallet, onEdit, onArchive }: WalletCardProps) {
  const typeConfig = getWalletTypeConfig(wallet.type)
  const Icon = typeConfig.icon

  return (
    <Card className="flex flex-col justify-between transition-all hover:shadow-md border-border">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle
              className="text-base font-semibold text-foreground truncate max-w-[180px]"
              title={wallet.name}
            >
              {wallet.name}
            </CardTitle>
            {wallet.isArchived ? <Badge variant="secondary">Archived</Badge> : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
            <span>{typeConfig.label}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-2">
          <Icon className={`h-5 w-5 ${typeConfig.color}`} aria-hidden="true" />
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        <div
          className="text-2xl font-bold tracking-tight text-foreground font-mono truncate"
          title={formatBalance(wallet.balance, wallet.currency)}
        >
          {formatBalance(wallet.balance, wallet.currency)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Currency: {wallet.currency}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(wallet)}
          disabled={wallet.isArchived}
          title={wallet.isArchived ? 'Cannot edit archived wallet' : 'Edit wallet'}
          aria-label={`Edit ${wallet.name}`}
        >
          <Edit2 className="h-4 w-4 mr-1.5" />
          <span>Edit</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onArchive(wallet)}
          disabled={wallet.isArchived}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          title={wallet.isArchived ? 'Already archived' : 'Archive wallet'}
          aria-label={`Archive ${wallet.name}`}
        >
          <Archive className="h-4 w-4 mr-1.5" />
          <span>Archive</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
