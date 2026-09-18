import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { useCategories } from '@/features/categories/useCategories'
import { usePeople } from '@/features/people/usePeople'
import { useTransactions } from '@/features/transactions/useTransactions'
import { useWallets } from '@/features/wallets/useWallets'
import type { AnalyticsPeriodPreset } from './analytics.types'
import {
  calculateAnalyticsExecutiveKPIs,
  calculateBeneficiaryDistribution,
  calculateCategoryHeatmap,
  calculateMonthlySpendingComparison,
} from './analytics.utils'
import { AnalyticsExecutiveSummary } from './components/AnalyticsExecutiveSummary'
import { BeneficiaryDonutChart } from './components/BeneficiaryDonutChart'
import { CategorySpendingHeatmap } from './components/CategorySpendingHeatmap'
import { MonthlySpendingComparisonChart } from './components/MonthlySpendingComparisonChart'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function AnalyticsPage() {
  const [periodPreset, setPeriodPreset] = useState<AnalyticsPeriodPreset>('6_MONTHS')
  const [beneficiaryMode, setBeneficiaryMode] = useState<'person' | 'relationship'>('person')
  const [comparisonRange, setComparisonRange] = useState<number>(6)

  // Fetch live active database data (max cursor limit 200)
  const { data: txData, isLoading: isTxLoading } = useTransactions({ limit: 200 })
  const { people, isLoading: isPeopleLoading } = usePeople()
  const { superCategories, subCategories, isLoading: isCategoriesLoading } = useCategories()
  const { data: wallets = [], isLoading: isWalletsLoading } = useWallets()

  const transactions = useMemo(() => txData?.data ?? [], [txData])
  const isLoading = isTxLoading || isPeopleLoading || isCategoriesLoading || isWalletsLoading

  const dominantCurrency = useMemo(
    () => wallets.find((w) => !w.isArchived)?.currency ?? 'BDT',
    [wallets],
  )

  // Compute date filter boundary based on preset
  const { dateFrom, monthsCount } = useMemo(() => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`

    switch (periodPreset) {
      case '3_MONTHS': {
        const d = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        return { dateFrom: fmt(d), monthsCount: 3 }
      }
      case '6_MONTHS': {
        const d = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        return { dateFrom: fmt(d), monthsCount: 6 }
      }
      case '12_MONTHS': {
        const d = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        return { dateFrom: fmt(d), monthsCount: 12 }
      }
      case 'ALL_TIME':
      default:
        return { dateFrom: undefined, monthsCount: 12 }
    }
  }, [periodPreset])

  // Computed data models
  const beneficiaryData = useMemo(
    () =>
      calculateBeneficiaryDistribution(transactions, people, {
        mode: beneficiaryMode,
        dateFrom,
      }),
    [transactions, people, beneficiaryMode, dateFrom],
  )

  const monthlyComparisonData = useMemo(
    () => calculateMonthlySpendingComparison(transactions, comparisonRange),
    [transactions, comparisonRange],
  )

  const categoryHeatmapData = useMemo(
    () => calculateCategoryHeatmap(transactions, subCategories, superCategories, monthsCount),
    [transactions, subCategories, superCategories, monthsCount],
  )

  const executiveKPIs = useMemo(
    () => calculateAnalyticsExecutiveKPIs(transactions, people, dominantCurrency, monthsCount),
    [transactions, people, dominantCurrency, monthsCount],
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header with Period Controls */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Advanced Visual Analytics
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deep visual insights into household spending, family allocation, and cashflow trends
              </p>
            </div>
          </div>
        </div>

        {/* Global Period Filter Pills */}
        <div className="flex items-center rounded-xl border border-border/60 bg-muted/40 p-1 text-xs font-medium self-start md:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => {
              setPeriodPreset('3_MONTHS')
              setComparisonRange(3)
            }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              periodPreset === '3_MONTHS'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 3 Months
          </button>
          <button
            type="button"
            onClick={() => {
              setPeriodPreset('6_MONTHS')
              setComparisonRange(6)
            }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              periodPreset === '6_MONTHS'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Last 6 Months
          </button>
          <button
            type="button"
            onClick={() => {
              setPeriodPreset('12_MONTHS')
              setComparisonRange(12)
            }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              periodPreset === '12_MONTHS'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            This Year (12M)
          </button>
          <button
            type="button"
            onClick={() => {
              setPeriodPreset('ALL_TIME')
              setComparisonRange(12)
            }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              periodPreset === 'ALL_TIME'
                ? 'bg-card text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Time
          </button>
        </div>
      </motion.div>

      {/* 4 Executive KPI Metric Cards */}
      <motion.div variants={sectionVariants}>
        <AnalyticsExecutiveSummary kpis={executiveKPIs} isLoading={isLoading} />
      </motion.div>

      {/* Charts Grid: Beneficiary Donut + Monthly Comparison Bar */}
      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <BeneficiaryDonutChart
            data={beneficiaryData}
            currency={dominantCurrency}
            isLoading={isLoading}
            mode={beneficiaryMode}
            onModeChange={setBeneficiaryMode}
          />
        </div>
        <div className="lg:col-span-7">
          <MonthlySpendingComparisonChart
            data={monthlyComparisonData}
            currency={dominantCurrency}
            isLoading={isLoading}
            selectedRange={comparisonRange}
            onRangeChange={setComparisonRange}
          />
        </div>
      </motion.div>

      {/* Category Spending Heatmap Matrix */}
      <motion.div variants={sectionVariants}>
        <CategorySpendingHeatmap
          rows={categoryHeatmapData.rows}
          monthColumns={categoryHeatmapData.monthColumns}
          currency={dominantCurrency}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  )
}

export default AnalyticsPage
