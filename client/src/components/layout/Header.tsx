import { useLocation } from 'react-router'
import { Menu, ChevronRight, Home } from 'lucide-react'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

const routeMeta: Record<string, { title: string; description?: string }> = {
  '/': { title: 'Dashboard', description: 'Financial overview' },
  '/wallets': { title: 'Accounts', description: 'Bank, cash, cards & savings' },
  '/transactions': { title: 'Transactions', description: 'History & records' },
  '/categories': { title: 'Categories', description: 'Finance taxonomy & hierarchy' },
  '/people': { title: 'People & Dependents', description: 'Track expenses by person' },
  '/budgets': { title: 'Budgets', description: 'Spending limits' },
  '/savings-goals': { title: 'Savings Goals', description: 'Track your targets' },
  '/loans': { title: 'Loans & Debts', description: 'Debts & repayments' },
  '/reports': { title: 'Reports', description: 'Financial analytics & receipts' },
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const location = useLocation()
  const meta = routeMeta[location.pathname] ?? { title: 'FinFlow' }
  const isRoot = location.pathname === '/'

  return (
    <header className="sticky top-0 z-30 flex h-[58px] w-full items-center justify-between border-b border-border/60 bg-card/95 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb + Page Title */}
        <div className="flex flex-col justify-center">
          {/* Breadcrumb */}
          {!isRoot ? (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-[11px] text-muted-foreground/70 mb-0.5"
            >
              <Home className="h-2.5 w-2.5" />
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="font-medium text-muted-foreground">{meta.title}</span>
            </nav>
          ) : null}

          {/* Page title */}
          <h1 className="text-sm font-semibold text-foreground leading-none tracking-tight">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right — User menu */}
      <div className="flex items-center gap-3">
        {/* Subtle date display */}
        <div className="hidden lg:block text-right">
          <p className="text-[11px] font-medium text-muted-foreground tabular-nums">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="h-4 w-px bg-border/60 hidden lg:block" />

        <UserMenu />
      </div>
    </header>
  )
}
