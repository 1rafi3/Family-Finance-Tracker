import { PlusCircle, Wallet as WalletIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface EmptyWalletStateProps {
  onCreateWallet: () => void
}

export function EmptyWalletState({ onCreateWallet }: EmptyWalletStateProps) {
  return (
    <Card className="border-dashed border-2 border-border bg-card/50 p-8 text-center">
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <WalletIcon className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-lg font-semibold text-foreground">No Wallets Created Yet</h3>
          <p className="text-sm text-muted-foreground">
            Get started by adding your first wallet to track income, cash, bank accounts, or mobile
            money.
          </p>
        </div>
        <Button onClick={onCreateWallet} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Add First Wallet</span>
        </Button>
      </CardContent>
    </Card>
  )
}
