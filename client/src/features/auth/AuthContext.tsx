import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { LoginInput, RegisterInput, User } from '@family-finance/shared'
import {
  apiClient,
  AUTH_UNAUTHORIZED_EVENT,
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from '@/lib/apiClient'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginInput) => Promise<void>
  register: (credentials: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const queryClient = useQueryClient()

  const handleLogoutLocal = useCallback(() => {
    removeStoredToken()
    setUser(null)
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  const refetchUser = useCallback(async () => {
    const activeToken = getStoredToken()
    if (!activeToken) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }

    try {
      const data = await apiClient<{ user: User }>('/auth/me')
      setUser(data.user)
      setToken(activeToken)
    } catch {
      handleLogoutLocal()
    } finally {
      setIsLoading(false)
    }
  }, [handleLogoutLocal])

  const login = useCallback(
    async (credentials: LoginInput) => {
      setIsLoading(true)
      try {
        const data = await apiClient<{ accessToken: string; user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        setStoredToken(data.accessToken)
        setToken(data.accessToken)
        setUser(data.user)
        queryClient.clear()
      } finally {
        setIsLoading(false)
      }
    },
    [queryClient],
  )

  const register = useCallback(
    async (credentials: RegisterInput) => {
      setIsLoading(true)
      try {
        await apiClient<{ user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        await login({ email: credentials.email, password: credentials.password })
      } finally {
        setIsLoading(false)
      }
    },
    [login],
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await apiClient.post('/auth/logout').catch(() => null)
    } finally {
      handleLogoutLocal()
      setIsLoading(false)
    }
  }, [handleLogoutLocal])

  useEffect(() => {
    void refetchUser()

    const onUnauthorized = () => {
      handleLogoutLocal()
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [refetchUser, handleLogoutLocal])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refetchUser,
    }),
    [user, token, isLoading, login, register, logout, refetchUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
