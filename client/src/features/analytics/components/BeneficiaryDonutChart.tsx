import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowUpRight, HeartHandshake, User, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BeneficiaryShare } from '../analytics.types'

export interface BeneficiaryDonutChartProps {
  data: BeneficiaryShare[]
  currency?: string
  isLoading?: boolean
  mode?: 'person' | 'relationship'
  onModeChange?: (mode: 'person' | 'relationship') => void
  isCompact?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: BeneficiaryShare
  }>
  currency?: string
}

function CustomTooltip({ active, payload, currency = 'BDT' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {item.relationship}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground pt-0.5">
          <span>Spent:</span>
          <span className="font-bold text-foreground">
            {currency}{' '}
            {item.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Share:</span>
          <span className="font-semibold text-primary">{item.percentage}%</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Transactions:</span>
          <span className="font-medium text-foreground">{item.count}</span>
        </div>
      </div>
    )
  }
  return null
}

export function BeneficiaryDonutChart({
  data,
  currency = 'BDT',
  isLoading = false,
  mode = 'person',
  onModeChange,
  isCompact = false,
}: BeneficiaryDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const activeData = data.filter((d) => d.amount > 0)
  const totalAmount = activeData.reduce((sum, d) => sum + d.amount, 0)
  const hasData = activeData.length > 0

  const activeItem = activeIndex !== null ? activeData[activeIndex] : null

  return (
    <Card className="h-full flex flex-col justify-between border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                Beneficiary Split (Myself vs Family)
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              "Spent For" household expenditure distribution
            </CardDescription>
          </div>

          {/* Mode Switcher (Person vs Relationship) */}
          {onModeChange && !isCompact ? (
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => onModeChange('person')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  mode === 'person'
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="h-3 w-3" />
                <span>By Person</span>
              </button>
              <button
                type="button"
                onClick={() => onModeChange('relationship')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  mode === 'relationship'
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="h-3 w-3" />
                <span>By Role</span>
              </button>
            </div>
          ) : isCompact ? (
            <Link
              to="/analytics"
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="h-[260px] w-full animate-pulse rounded-xl bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
            <HeartHandshake className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No beneficiary spending yet</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
              Tag expenses with family dependents or personal spending to see your distribution breakdown.
            </p>
          </div>
        ) : (
          <div
            className={`grid items-center gap-4 ${
              isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'
            }`}
          >
            {/* Donut Chart Container */}
            <div
              className={`relative flex items-center justify-center ${
                isCompact ? 'h-[200px]' : 'md:col-span-6 h-[240px]'
              }`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Pie
                    data={activeData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={isCompact ? 52 : 65}
                    outerRadius={isCompact ? 75 : 92}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {activeData.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        stroke="var(--background)"
                        strokeWidth={2}
                        className="transition-all duration-200 cursor-pointer hover:opacity-90"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metrics Callout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {activeItem ? activeItem.name : 'Total Outflow'}
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  {currency}{' '}
                  {activeItem
                    ? activeItem.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                    : totalAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                </span>
                <span className="text-[10px] font-semibold text-primary">
                  {activeItem ? `${activeItem.percentage}% share` : `${activeData.length} entities`}
                </span>
              </div>
            </div>

            {/* Side Itemized Legend & Breakdown */}
            <div
              className={`space-y-2.5 overflow-y-auto max-h-[240px] pr-1 ${
                isCompact ? 'mt-2' : 'md:col-span-6'
              }`}
            >
              {activeData.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    const idx = activeData.findIndex((d) => d.id === item.id)
                    setActiveIndex(idx >= 0 ? idx : null)
                  }}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`group flex items-center justify-between rounded-lg p-2 transition-colors border ${
                    activeItem?.id === item.id
                      ? 'bg-muted/60 border-border'
                      : 'border-transparent hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.relationship} • {item.count} tx{item.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground">
                      {currency}{' '}
                      {item.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-muted-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
