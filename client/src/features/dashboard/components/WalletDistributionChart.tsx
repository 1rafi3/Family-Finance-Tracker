import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBalance } from '@/features/wallets/wallet.constants'
import type { WalletDistributionDataPoint } from '../dashboard.analytics'

export interface WalletDistributionChartProps {
  data: WalletDistributionDataPoint[]
  currency?: string
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: WalletDistributionDataPoint;
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
          Balance: <span className="font-bold text-foreground">{formatBalance(item.balance.toFixed(2), currency)}</span>
        </p>
        <p className="text-muted-foreground">
          Share: <span className="font-semibold text-primary">{item.percentage}%</span>
        </p>
      </div>
    )
  }
  return null
}

export function WalletDistributionChart({
  data,
  currency = 'BDT',
  isLoading = false,
}: WalletDistributionChartProps) {
  const hasData = data.length > 0 && data.some((item) => item.balance > 0)

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Wallet Fund Distribution</CardTitle>
        <CardDescription className="text-xs">Balance allocation across active accounts</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] flex items-center justify-center">
        {isLoading ? (
          <div className="h-[240px] w-full animate-pulse rounded-md bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-44 w-full flex-col items-center justify-center rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No active wallet balances</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Add wallets with active balances to view your liquidity allocation pie chart.
            </p>
          </div>
        ) : (
          <div className="h-[240px] w-full" aria-label="Wallet Fund Distribution Pie Chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="balance"
                  nameKey="name"
                >
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
