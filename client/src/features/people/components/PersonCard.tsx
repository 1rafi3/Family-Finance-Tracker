import { Edit2, Archive, Receipt, User, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import type { PersonWithStats } from '../people.api'

export interface PersonCardProps {
  person: PersonWithStats
  currency?: string
  onEdit: (person: PersonWithStats) => void
  onArchive: (person: PersonWithStats) => void
  onView?: (person: PersonWithStats) => void
}

export function PersonCard({
  person,
  currency = 'BDT',
  onEdit,
  onArchive,
  onView,
}: PersonCardProps) {
  const color = person.color || '#3b82f6'
  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="h-full cursor-pointer"
      onClick={() => onView?.(person)}
    >
      <SpotlightCard
        spotlightColor={`${color}15`}
        className="h-full flex flex-col justify-between overflow-hidden border border-border/70 bg-card p-5 group"
      >
        {/* Top Header Strip Accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: color }}
        />

        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar Circle */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: `${color}18`,
                  color: color,
                  border: `1px solid ${color}30`,
                }}
              >
                {initials || <User className="h-5 w-5" />}
              </div>

              <div className="min-w-0 space-y-0.5">
                <h4 className="text-base font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors" title={person.name}>
                  {person.name}
                </h4>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                    {person.relationship}
                  </Badge>
                  {person.isArchived ? (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      Archived
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Inline Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(person)
                }}
                title="Edit Person"
                aria-label="Edit Person"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              {!person.isArchived ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(person)
                  }}
                  title="Archive Person"
                  aria-label="Archive Person"
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>

          {person.notes ? (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2" title={person.notes}>
              {person.notes}
            </p>
          ) : null}
        </div>

        {/* Bottom Spending Metrics */}
        <div className="mt-5 pt-3 border-t border-border/50 flex items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span>Total Spent</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-lg font-bold text-foreground font-mono leading-tight mt-0.5">
              <NumberTicker value={person.totalSpent} prefix={`${currency} `} decimals={2} />
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Receipt className="h-3.5 w-3.5" />
            <span className="font-semibold tabular-nums">{person.transactionCount}</span>
            <span>txns</span>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  )
}
