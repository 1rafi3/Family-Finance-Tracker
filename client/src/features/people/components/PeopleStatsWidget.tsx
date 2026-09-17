import { Users, DollarSign, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import type { PersonWithStats } from '../people.api'

export interface PeopleStatsWidgetProps {
  people: PersonWithStats[]
  currency?: string
}

export function PeopleStatsWidget({ people, currency = 'BDT' }: PeopleStatsWidgetProps) {
  const activePeople = people.filter((p) => !p.isArchived)
  const totalSpentAll = activePeople.reduce((sum, p) => sum + (p.totalSpent || 0), 0)

  const topPerson = [...activePeople].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Stat 1: Total People */}
      <Card className="border border-border/70 bg-card p-4">
        <CardContent className="p-0 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total People Tracked
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">
              {activePeople.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Dependents & Beneficiaries</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Stat 2: Total Spent on Dependents */}
      <Card className="border border-border/70 bg-card p-4">
        <CardContent className="p-0 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Dependent Spending
            </p>
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">
              <NumberTicker value={totalSpentAll} prefix={`${currency} `} decimals={2} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">All-time spent for others</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Stat 3: Top Spending Dependent */}
      <Card className="border border-border/70 bg-card p-4">
        <CardContent className="p-0 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Highest Allocation
            </p>
            <p className="text-lg font-bold tracking-tight text-foreground truncate mt-1">
              {topPerson && topPerson.totalSpent > 0 ? topPerson.name : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {topPerson && topPerson.totalSpent > 0
                ? `${currency} ${topPerson.totalSpent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} (${topPerson.relationship})`
                : 'No expenses assigned yet'}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
