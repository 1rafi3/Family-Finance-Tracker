import { NavLink } from 'react-router'
import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  PieChart,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  onOpenMenu: () => void
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-1 flex-col items-center justify-center py-1.5 px-1 transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
      isActive
        ? 'text-primary font-semibold'
        : 'text-muted-foreground hover:text-foreground',
    )

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/70 bg-card/95 backdrop-blur-md px-2 shadow-lg md:hidden print:hidden"
    >
      <NavLink to="/" end className={navItemClass}>
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px] tracking-tight mt-1">Home</span>
      </NavLink>

      <NavLink to="/wallets" className={navItemClass}>
        <Wallet className="h-5 w-5" />
        <span className="text-[10px] tracking-tight mt-1">Accounts</span>
      </NavLink>

      <NavLink to="/transactions" className={navItemClass}>
        <ArrowLeftRight className="h-5 w-5" />
        <span className="text-[10px] tracking-tight mt-1">Transact</span>
      </NavLink>

      <NavLink to="/budgets" className={navItemClass}>
        <PieChart className="h-5 w-5" />
        <span className="text-[10px] tracking-tight mt-1">Budgets</span>
      </NavLink>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-1 flex-col items-center justify-center py-1.5 px-1 text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-lg focus:outline-none"
        aria-label="Open full menu"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] tracking-tight mt-1">More</span>
      </button>
    </nav>
  )
}
