import { env } from '@/config/env'

export const TOKEN_STORAGE_KEY = 'family_finance_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiClientOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

export const AUTH_UNAUTHORIZED_EVENT = 'family_finance_unauthorized'

export function triggerUnauthorized(): void {
  removeStoredToken()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
  }
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const token = getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers,
  })

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    const errorData = json?.error
    const message = errorData?.message || `Request failed with status ${response.status}`
    const code = errorData?.code || 'UNKNOWN_ERROR'
    const details = errorData?.details

    // Only trigger global session-expiry handling when a token was present.
    // A 401 on an unauthenticated request (e.g. wrong login credentials)
    // must propagate as a plain ApiError so the UI can display it normally.
    if (response.status === 401 && token) {
      triggerUnauthorized()
    }

    throw new ApiError(response.status, code, message, details)
  }

  if (json && typeof json === 'object' && 'data' in json) {
    if ('pagination' in json) {
      return json as T
    }
    return json.data as T
  }

  return json as T
}

apiClient.get = <T>(path: string, options?: ApiClientOptions) =>
  apiClient<T>(path, { ...options, method: 'GET' })

apiClient.post = <T>(path: string, body?: unknown, options?: ApiClientOptions) =>
  apiClient<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

apiClient.patch = <T>(path: string, body?: unknown, options?: ApiClientOptions) =>
  apiClient<T>(path, {
    ...options,
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

apiClient.delete = <T>(path: string, options?: ApiClientOptions) =>
  apiClient<T>(path, { ...options, method: 'DELETE' })
