import { motion } from 'framer-motion'
import { Lightbulb, PieChart, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { QuickInsight } from '../dashboard.analytics'

export interface QuickInsightsWidgetProps {
  insights: QuickInsight[]
  isLoading?: boolean
}

export function QuickInsightsWidget({ insights, isLoading = false }: QuickInsightsWidgetProps) {
  const getIcon = (type: QuickInsight['type']) => {
    switch (type) {
      case 'category':
        return PieChart
      case 'expense':
        return TrendingUp
      case 'wallet':
        return Wallet
      case 'savings':
        return PiggyBank
      default:
        return Lightbulb
    }
  }

  return (
    <Card className="h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <CardTitle className="text-base font-semibold">Quick Financial Insights</CardTitle>
            <CardDescription className="text-xs">Automated summary &amp; intelligence</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-1">
        {isLoading ? (
          <div className="flex flex-col gap-2.5 py-1">
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
            <div className="h-16 animate-pulse rounded-lg bg-muted/40" />
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-lg bg-muted/20 p-6 my-auto">
            <Lightbulb className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">No insights available</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Record transactions to unlock automatic financial insights and spending breakdowns.
            </p>
          </div>
        ) : (
          <div className="group/insights flex flex-col gap-2.5">
            {insights.map((item) => {
              const Icon = getIcon(item.type)
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.015, x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card transition-all duration-300 min-w-0 group-hover/insights:opacity-80 hover:!opacity-100 hover:shadow-md hover:border-primary/40 hover:z-10 cursor-default"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-muted-foreground">{item.title}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground font-mono leading-tight">
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
