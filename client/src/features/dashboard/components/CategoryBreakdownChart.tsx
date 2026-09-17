import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryExpenseDataPoint } from '../dashboard.analytics'

export interface CategoryBreakdownChartProps {
  data: CategoryExpenseDataPoint[]
  currency?: string
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryExpenseDataPoint;
  }>;
  currency?: string;
}

function CustomTooltip({ active, payload, currency = 'BDT' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-md text-xs space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}
        </p>
        <p className="text-muted-foreground">
          Total Spent:{' '}
          <span className="font-bold text-foreground">
            {currency}{' '}
            {item.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        <p className="text-muted-foreground">
          Share: <span className="font-semibold text-destructive">{item.percentage}%</span>
        </p>
      </div>
    )
  }
  return null
}

export function CategoryBreakdownChart({
  data,
  currency = 'BDT',
  isLoading = false,
}: CategoryBreakdownChartProps) {
  const topCategories = data.slice(0, 5)
  const hasData = topCategories.length > 0 && topCategories.some((c) => c.amount > 0)

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Expense by Category</CardTitle>
        <CardDescription className="text-xs">Highest spending category distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] flex items-center justify-center">
        {isLoading ? (
          <div className="h-[240px] w-full animate-pulse rounded-md bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-44 w-full flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No expense categories recorded</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Log expense transactions to see where your money goes across categories.
            </p>
          </div>
        ) : (
          <div className="h-[240px] w-full" aria-label="Expenses by Category Bar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Bar dataKey="amount" name="Amount" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
