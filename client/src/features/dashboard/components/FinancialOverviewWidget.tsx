import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from 'lucide-react'
import { formatBalance } from '@/features/wallets/wallet.constants'
import { useWallets } from '@/features/wallets/useWallets'
import { useTransactions } from '@/features/transactions/useTransactions'
import {
  calculateCashFlowTrend,
  calculateDashboardMetrics,
} from '../dashboard.analytics'
import { CashFlowChart } from './CashFlowChart'
import { FinancialMetricCard } from './FinancialMetricCard'

export function FinancialOverviewWidget() {
  const { data: walletsData, isLoading: isWalletsLoading } = useWallets()
  const { data: txData, isLoading: isTxLoading } = useTransactions({ limit: 200 })

  const wallets = useMemo(() => walletsData ?? [], [walletsData])
  const transactions = useMemo(() => txData?.data ?? [], [txData])
  const isLoading = isWalletsLoading || isTxLoading

  const metrics = useMemo(
    () => calculateDashboardMetrics(wallets, transactions),
    [wallets, transactions],
  )

  const cashFlowTrend = useMemo(
    () => calculateCashFlowTrend(transactions),
    [transactions],
  )

  return (
    <div className="space-y-6">
      {/* 4 Core Top Metric Cards */}
      <div className="group/grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          title="Current Balance"
          amount={formatBalance(metrics.totalBalance.toFixed(2), metrics.currency)}
          subtitle="Combined active wallets"
          icon={Wallet}
          trend="neutral"
          isLoading={isLoading}
        />
        <FinancialMetricCard
          title="Monthly Income"
          amount={formatBalance(metrics.monthlyIncome.toFixed(2), metrics.currency)}
          subtitle="Current calendar month"
          icon={ArrowUpRight}
          trend="up"
          trendLabel="Income"
          isLoading={isLoading}
        />
        <FinancialMetricCard
          title="Monthly Expenses"
          amount={formatBalance(metrics.monthlyExpense.toFixed(2), metrics.currency)}
          subtitle="Current calendar month"
          icon={ArrowDownRight}
          trend="down"
          trendLabel="Expense"
          isLoading={isLoading}
        />
        <FinancialMetricCard
          title="Net Cash Flow"
          amount={formatBalance(metrics.netCashFlow.toFixed(2), metrics.currency)}
          subtitle={metrics.netCashFlow >= 0 ? 'Surplus this month' : 'Deficit this month'}
          icon={DollarSign}
          trend={metrics.netCashFlow >= 0 ? 'up' : 'down'}
          trendLabel={metrics.netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
          isLoading={isLoading}
        />
      </div>

      {/* Cash Flow Recharts Widget */}
      <CashFlowChart data={cashFlowTrend} currency={metrics.currency} isLoading={isLoading} />
    </div>
  )
}
