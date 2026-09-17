import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import type { UserRole } from '@family-finance/shared'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { UnauthorizedPage } from '@/components/common/UnauthorizedPage'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  children?: ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen message="Verifying session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <UnauthorizedPage />
  }

  return children ? <>{children}</> : <Outlet />
}
