import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlyComparisonDataPoint } from '../analytics.types'

export interface MonthlySpendingComparisonChartProps {
  data: MonthlyComparisonDataPoint[]
  currency?: string
  isLoading?: boolean
  selectedRange?: number
  onRangeChange?: (range: number) => void
}

type ViewMode = 'inflow_outflow' | 'personal_family'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
  currency?: string
  data?: MonthlyComparisonDataPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
  currency = 'BDT',
  data = [],
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = data.find((d) => d.label === label)
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <p className="font-bold text-foreground">{point?.fullLabel ?? label}</p>
          {point?.momExpenseChangePct !== null && point?.momExpenseChangePct !== undefined ? (
            <span
              className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                point.momExpenseChangePct > 0
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {point.momExpenseChangePct > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {point.momExpenseChangePct > 0 ? '+' : ''}
              {point.momExpenseChangePct}% MoM
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-foreground">
                {currency}{' '}
                {entry.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}

          {point ? (
            <div className="pt-1 mt-1 border-t border-border/50 flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Net Balance:</span>
              <span className={point.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                {currency}{' '}
                {point.net.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
  return null
}

export function MonthlySpendingComparisonChart({
  data,
  currency = 'BDT',
  isLoading = false,
  selectedRange = 6,
  onRangeChange,
}: MonthlySpendingComparisonChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('inflow_outflow')

  const hasData = data.some((d) => d.income > 0 || d.expense > 0)
  const currentMonthPoint = data[data.length - 1]

  return (
    <Card className="h-full flex flex-col justify-between border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <BarChart3 className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                Monthly Spending & Flow Comparison
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Multi-month cash flow and personal vs family spending trend
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setViewMode('inflow_outflow')}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  viewMode === 'inflow_outflow'
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inflow vs Outflow
              </button>
              <button
                type="button"
                onClick={() => setViewMode('personal_family')}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  viewMode === 'personal_family'
                    ? 'bg-card text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Personal vs Family
              </button>
            </div>

            {/* Range Selector */}
            {onRangeChange ? (
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[11px] font-medium">
                {[3, 6, 12].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => onRangeChange(range)}
                    className={`rounded-md px-2 py-1 transition-colors ${
                      selectedRange === range
                        ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range}M
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="h-[280px] w-full animate-pulse rounded-xl bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No monthly transaction data</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
              Add income and expense transactions to unlock month-over-month trend comparisons.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[280px] w-full" aria-label="Monthly Comparison Chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} data={data} />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                  />

                  {viewMode === 'inflow_outflow' ? (
                    <>
                      <Bar
                        dataKey="income"
                        name="Total Inflow"
                        fill="#10b981"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="expense"
                        name="Total Outflow"
                        fill="#ef4444"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey="personalExpense"
                        name="Myself (Personal)"
                        fill="#6366f1"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="familyExpense"
                        name="Family & Dependents"
                        fill="#f59e0b"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={32}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Context Summary Footer */}
            {currentMonthPoint ? (
              <div className="flex flex-wrap items-center justify-between rounded-xl bg-muted/40 p-3 text-xs gap-3 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>Current Month ({currentMonthPoint.label}):</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {currency}{' '}
                    {currentMonthPoint.expense.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {currentMonthPoint.momExpenseChangePct !== null ? (
                    <div className="flex items-center gap-1 font-semibold">
                      <span className="text-muted-foreground">MoM Trend:</span>
                      <span
                        className={`flex items-center ${
                          currentMonthPoint.momExpenseChangePct > 0
                            ? 'text-rose-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {currentMonthPoint.momExpenseChangePct > 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {Math.abs(currentMonthPoint.momExpenseChangePct)}%
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1 font-semibold">
                    <span className="text-muted-foreground">Net Flow:</span>
                    <span
                      className={
                        currentMonthPoint.net >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }
                    >
                      {currentMonthPoint.net >= 0 ? '+' : ''}
                      {currency}{' '}
                      {currentMonthPoint.net.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
