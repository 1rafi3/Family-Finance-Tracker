import type { ElementType } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Skeleton } from '@/components/ui/skeleton'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

export interface FinancialMetricCardProps {
  title: string
  amount: string
  subtitle: string
  icon: ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  isLoading?: boolean
  className?: string
}

function getAmountFontSize(amount: string): string {
  const len = amount.length
  if (len <= 10) return 'text-xl sm:text-2xl'
  if (len <= 15) return 'text-lg sm:text-xl'
  if (len <= 20) return 'text-base sm:text-lg break-all'
  return 'text-sm sm:text-base truncate'
}

/**
 * Extracts currency prefix and numeric value from formatted amount string.
 * Example: "BDT 15,200.00" -> { prefix: "BDT ", num: 15200 }
 */
function parseAmountParts(amountStr: string): { prefix: string; num: number | null } {
  const match = amountStr.match(/^([^\d\-+]*)([\d,]+(?:\.\d+)?)/)
  if (match) {
    const prefix = match[1]
    const num = parseFloat(match[2].replace(/,/g, ''))
    if (!isNaN(num)) {
      return { prefix, num }
    }
  }
  return { prefix: '', num: null }
}

export function FinancialMetricCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendLabel,
  isLoading = false,
  className,
}: FinancialMetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn('h-full flex flex-col justify-between rounded-xl border bg-card p-5', className)}>
        <div className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    )
  }

  const fontSizeClass = getAmountFontSize(amount)
  const { prefix, num } = parseAmountParts(amount)

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <SpotlightCard
        spotlightColor={
          trend === 'up'
            ? 'rgba(16, 185, 129, 0.12)'
            : trend === 'down'
            ? 'rgba(239, 68, 68, 0.12)'
            : 'rgba(59, 130, 246, 0.10)'
        }
        className={cn(
          'h-full flex flex-col justify-between overflow-hidden border border-border/70 bg-card/80 backdrop-blur-sm',
          'hover:border-primary/50 hover:ring-1 hover:ring-primary/20',
          className,
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-normal mr-2">
            {title}
          </CardTitle>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 transition-transform duration-300">
            <Icon className="h-4.5 w-4.5" />
          </div>
        </CardHeader>

        <CardContent className="pt-1 flex-1 flex flex-col justify-between">
          <div
            className={cn(
              'font-bold tracking-tight text-foreground font-mono min-w-0 transition-all duration-200',
              fontSizeClass,
            )}
            title={amount}
          >
            {num !== null ? (
              <NumberTicker value={num} prefix={prefix} decimals={2} />
            ) : (
              amount
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 truncate">
            {trend === 'up' ? (
              <span className="flex items-center text-success font-semibold shrink-0">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                {trendLabel || 'Income'}
              </span>
            ) : trend === 'down' ? (
              <span className="flex items-center text-destructive font-semibold shrink-0">
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                {trendLabel || 'Expense'}
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground shrink-0">
                <Minus className="h-3.5 w-3.5 mr-0.5" />
                {trendLabel || subtitle}
              </span>
            )}
            {trend !== 'neutral' ? (
              <span className="text-muted-foreground truncate" title={subtitle}>
                — {subtitle}
              </span>
            ) : null}
          </div>
        </CardContent>
      </SpotlightCard>
    </motion.div>
  )
}
