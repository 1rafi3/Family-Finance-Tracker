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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CashFlowDataPoint } from '../dashboard.analytics'

export interface CashFlowChartProps {
  data: CashFlowDataPoint[]
  currency?: string
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  currency?: string;
}

function CustomTooltip({ active, payload, label, currency = 'BDT' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-md text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
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
        </div>
      </div>
    )
  }
  return null
}

export function CashFlowChart({ data, currency = 'BDT', isLoading = false }: CashFlowChartProps) {
  const hasData = data.some((item) => item.income > 0 || item.expense > 0)

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Monthly Cash Flow Trend</CardTitle>
        <CardDescription className="text-xs">Income vs Expense activity over recent months</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
        {isLoading ? (
          <div className="h-[280px] w-full animate-pulse rounded-md bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No monthly transactions found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Record income and expenses to generate a monthly cash flow comparison chart.
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full" aria-label="Monthly Cash Flow Bar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
