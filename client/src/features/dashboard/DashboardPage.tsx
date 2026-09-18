import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useWallets } from '@/features/wallets/useWallets'
import { useTransactions } from '@/features/transactions/useTransactions'
import { usePeople } from '@/features/people/usePeople'
import { BeneficiaryDonutChart } from '@/features/analytics/components/BeneficiaryDonutChart'
import { calculateBeneficiaryDistribution } from '@/features/analytics/analytics.utils'
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart'
import { DashboardHeader } from './components/DashboardHeader'
import { FinancialOverviewWidget } from './components/FinancialOverviewWidget'
import { QuickActions } from './components/QuickActions'
import { QuickInsightsWidget } from './components/QuickInsightsWidget'
import { RecentTransactionsWidget } from './components/RecentTransactionsWidget'
import { WalletDistributionChart } from './components/WalletDistributionChart'
import { WalletSummaryWidget } from './components/WalletSummaryWidget'
import {
  calculateCategoryBreakdown,
  calculateWalletDistribution,
  generateQuickInsights,
} from './dashboard.analytics'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export function DashboardPage() {
  const { data: walletsData, isLoading: isWalletsLoading } = useWallets()
  const { data: txData, isLoading: isTxLoading } = useTransactions({ limit: 200 })
  const { people, isLoading: isPeopleLoading } = usePeople()

  const wallets = useMemo(() => walletsData ?? [], [walletsData])
  const transactions = useMemo(() => txData?.data ?? [], [txData])
  const isLoading = isWalletsLoading || isTxLoading || isPeopleLoading

  const walletDistribution = useMemo(() => calculateWalletDistribution(wallets), [wallets])
  const categoryBreakdown = useMemo(() => calculateCategoryBreakdown(transactions), [transactions])
  const beneficiaryDistribution = useMemo(
    () => calculateBeneficiaryDistribution(transactions, people, { mode: 'person' }),
    [transactions, people],
  )
  const quickInsights = useMemo(() => generateQuickInsights(wallets, transactions), [wallets, transactions])
  const dominantCurrency = useMemo(
    () => wallets.find((w) => !w.isArchived)?.currency ?? 'BDT',
    [wallets],
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Welcome Header */}
      <motion.div variants={sectionVariants}>
        <DashboardHeader />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={sectionVariants}>
        <QuickActions />
      </motion.div>

      {/* Financial KPIs + Cash Flow Chart */}
      <motion.div variants={sectionVariants}>
        <FinancialOverviewWidget />
      </motion.div>

      {/* Analytics Grid */}
      <motion.div variants={sectionVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <BeneficiaryDonutChart
            data={beneficiaryDistribution}
            currency={dominantCurrency}
            isLoading={isLoading}
            isCompact
          />
          <CategoryBreakdownChart
            data={categoryBreakdown}
            currency={dominantCurrency}
            isLoading={isLoading}
          />
          <WalletDistributionChart
            data={walletDistribution}
            currency={dominantCurrency}
            isLoading={isLoading}
          />
          <QuickInsightsWidget insights={quickInsights} isLoading={isLoading} />
        </div>
      </motion.div>

      {/* Bottom split — Wallets + Recent Transactions */}
      <motion.div variants={sectionVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletSummaryWidget />
          <RecentTransactionsWidget />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default DashboardPage
