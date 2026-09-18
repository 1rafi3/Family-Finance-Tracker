import { Calendar, HeartHandshake, PieChart, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AnalyticsExecutiveKPIs } from '../analytics.types'

export interface AnalyticsExecutiveSummaryProps {
  kpis: AnalyticsExecutiveKPIs
  isLoading?: boolean
}

export function AnalyticsExecutiveSummary({
  kpis,
  isLoading = false,
}: AnalyticsExecutiveSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl animate-pulse bg-muted/40" />
        ))}
      </div>
    )
  }

  const { currency } = kpis

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Household vs Personal Allocation */}
      <Card className="border-border/60 shadow-xs hover:border-border transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Household Allocation</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <PieChart className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-bold text-foreground">
                {kpis.personalRatio}% / {kpis.familyRatio}%
              </p>
              <span className="text-[11px] text-muted-foreground font-medium">Personal / Family</span>
            </div>

            {/* Split Progress Bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/60 flex">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${kpis.personalRatio}%` }}
                title={`Personal: ${kpis.personalRatio}%`}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${kpis.familyRatio}%` }}
                title={`Family: ${kpis.familyRatio}%`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Top Spending Beneficiary */}
      <Card className="border-border/60 shadow-xs hover:border-border transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Top Family Beneficiary</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>

          <div>
            {kpis.topBeneficiary ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold text-foreground truncate max-w-[130px]">
                    {kpis.topBeneficiary.name}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                    {kpis.topBeneficiary.relationship}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currency}{' '}
                  {kpis.topBeneficiary.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className="font-semibold text-primary">
                    ({kpis.topBeneficiary.percentage}%)
                  </span>
                </p>
              </>
            ) : (
              <div>
                <p className="text-base font-semibold text-foreground">Myself Only</p>
                <p className="text-xs text-muted-foreground mt-1">No dependent expenses recorded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Monthly Average Burn Rate */}
      <Card className="border-border/60 shadow-xs hover:border-border transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly Burn Rate</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          <div>
            <p className="text-lg font-bold text-foreground">
              {currency}{' '}
              {kpis.avgMonthlyBurn.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Average outflow per active month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Peak Spending Month */}
      <Card className="border-border/60 shadow-xs hover:border-border transition-all">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Peak Outflow Month</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Calendar className="h-4 w-4" />
            </div>
          </div>

          <div>
            {kpis.peakMonth ? (
              <>
                <p className="text-base font-bold text-foreground truncate">
                  {kpis.peakMonth.label}
                </p>
                <p className="text-xs text-rose-500 font-semibold mt-1">
                  {currency}{' '}
                  {kpis.peakMonth.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  outflow
                </p>
              </>
            ) : (
              <div>
                <p className="text-base font-semibold text-foreground">-</p>
                <p className="text-xs text-muted-foreground mt-1">No recorded peaks</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
