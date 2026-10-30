import { useState } from 'react'
import { Link } from 'react-router'
import {
  BarChart3,
  Landmark,
  PiggyBank,
  PieChart,
  PlusCircle,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateTransactionModal } from '@/features/transactions/components/CreateTransactionModal'
import { CreateWalletModal } from '@/features/wallets/components/CreateWalletModal'
import { useWallets } from '@/features/wallets/useWallets'

export function QuickActions() {
  const { data: walletsData } = useWallets()
  const wallets = walletsData ?? []

  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false)
  const [isCreateTxOpen, setIsCreateTxOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 justify-center"
              onClick={() => setIsCreateTxOpen(true)}
            >
              <PlusCircle className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Add Transaction</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 justify-center"
              onClick={() => setIsCreateWalletOpen(true)}
            >
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Create Wallet</span>
            </Button>

            <Link to="/savings-goals" className="contents">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 justify-center w-full"
              >
                <PiggyBank className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Savings Goals</span>
              </Button>
            </Link>

            <Link to="/loans" className="contents">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 justify-center w-full"
              >
                <Landmark className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Loans & Debts</span>
              </Button>
            </Link>

            <Link to="/budgets" className="contents">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 justify-center w-full"
              >
                <PieChart className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Monthly Budgets</span>
              </Button>
            </Link>

            <Link to="/reports" className="contents">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-2 justify-center w-full"
              >
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Print Statements</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CreateWalletModal
        isOpen={isCreateWalletOpen}
        onClose={() => setIsCreateWalletOpen(false)}
      />

      <CreateTransactionModal
        isOpen={isCreateTxOpen}
        onClose={() => setIsCreateTxOpen(false)}
        wallets={wallets}
      />
    </>
  )
}
