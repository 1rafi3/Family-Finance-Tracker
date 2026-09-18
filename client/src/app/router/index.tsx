import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { NotFoundPage } from '@/components/common/NotFoundPage'
import { Placeholder } from '@/components/common/Placeholder'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicRoute } from '@/features/auth/PublicRoute'

// Lazy load page components for route-based code splitting
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const WalletListPage = lazy(() => import('@/features/wallets/WalletListPage'))
const TransactionListPage = lazy(() => import('@/features/transactions/TransactionListPage'))
const CategoriesPage = lazy(() => import('@/features/categories/CategoriesPage'))
const PeoplePage = lazy(() => import('@/features/people/PeoplePage'))
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'))
const BudgetsPage = lazy(() => import('@/features/budgets/BudgetsPage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen message="Loading page..." />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes inside App Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="wallets" element={<WalletListPage />} />
            <Route path="transactions" element={<TransactionListPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="savings-goals" element={<Placeholder title="Savings Goals" />} />
            <Route path="loans" element={<Placeholder title="Loans & Debts Tracker" />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* 404 Not Found Page */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
