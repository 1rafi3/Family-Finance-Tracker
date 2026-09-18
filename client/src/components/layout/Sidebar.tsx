import type { ElementType } from 'react'
import { NavLink } from 'react-router'
import {
  ArrowLeftRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  Landmark,
  PieChart,
  PiggyBank,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onMobileNavigate?: () => void
}

interface NavItem {
  label: string
  to: string
  icon: ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Accounts', to: '/wallets', icon: Wallet },
  { label: 'Transactions', to: '/transactions', icon: ArrowLeftRight },
  { label: 'Categories', to: '/categories', icon: FolderTree },
  { label: 'People (Spent For)', to: '/people', icon: Users },
  { label: 'Budgets', to: '/budgets', icon: PieChart },
  { label: 'Analytics', to: '/analytics', icon: TrendingUp },
  { label: 'Savings Goals', to: '/savings-goals', icon: PiggyBank },
  { label: 'Loans & Debts', to: '/loans', icon: Landmark },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
]

export function Sidebar({ isCollapsed, onToggleCollapse, onMobileNavigate }: SidebarProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5 space-x-3',
      isActive
        ? [
            'bg-primary/10 text-primary font-semibold',
            // Left border indicator
            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
            'before:h-5 before:w-1 before:rounded-full before:bg-primary',
          ].join(' ')
        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
    )

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/60 bg-card text-card-foreground',
        'transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-[60px]' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-[58px] items-center border-b border-border/60 px-3">
        <NavLink
          to="/"
          onClick={onMobileNavigate}
          className={cn(
            'flex items-center overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
            isCollapsed ? 'justify-center w-full' : 'space-x-3',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          {!isCollapsed ? (
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-foreground leading-none truncate">
                FinFlow
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Personal Finance</p>
            </div>
          ) : null}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onMobileNavigate}
              className={navLinkClass}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
              {!isCollapsed ? <span>{item.label}</span> : null}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="hidden md:flex p-2 border-t border-border/60">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex h-8 w-full items-center justify-center rounded-lg',
            'text-muted-foreground transition-all duration-150',
            'hover:bg-muted/60 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex w-full items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Collapse</span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
