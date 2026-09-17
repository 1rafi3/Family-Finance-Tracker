import { CalendarDays, LayoutDashboard } from 'lucide-react'
import { UserRole } from '@family-finance/shared'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardHeader() {
  const { user } = useAuth()

  if (!user) return null

  const roleVariant = user.role === UserRole.ADMIN ? 'default' : 'secondary'
  const today = new Date()
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const monthStr = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
              {getGreeting()}, {user.firstName}!
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
          </div>
          <Badge variant={roleVariant} className="ml-1 shrink-0">{user.role}</Badge>
        </div>
        <p className="text-sm text-muted-foreground pl-[3.25rem]">
          Here&apos;s your financial overview for{' '}
          <span className="font-semibold text-foreground">{monthStr}</span>. Track income, expenses,
          and account balances in real-time.
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0">
        <CalendarDays className="h-5 w-5 text-muted-foreground hidden md:block" />
        <div>
          <p className="text-xs font-medium text-foreground">Reporting period</p>
          <p className="text-xs text-primary font-semibold mt-0.5">{monthStr}</p>
          <p
            className="text-xs text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
      </div>
    </div>
  )
}
