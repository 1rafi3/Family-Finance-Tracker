import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { useAuth } from './useAuth'

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
