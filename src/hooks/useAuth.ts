import { createContext, useContext, useEffect, useMemo, useState, createElement, type ReactNode } from 'react'
import { useSettings } from './useSettings'
import type { SupabaseAuthConfig } from '../types'

type User = {
  email: string | null
  [key: string]: unknown
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  authReady: boolean
  authRequired: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'gitbackup-supabase-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useSettings()
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (loading) return

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User
        setUser(parsed)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
    setAuthReady(true)
  }, [loading])

  useEffect(() => {
    if (settings.supabaseAuth.enabled && user && settings.supabaseAuth.allowedEmail) {
      if (user.email !== settings.supabaseAuth.allowedEmail) {
        setUser(null)
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [settings.supabaseAuth, user])

  const authRequired = useMemo(
    () => settings.supabaseAuth.enabled && !!settings.supabaseAuth.projectUrl && !!settings.supabaseAuth.anonKey,
    [settings.supabaseAuth],
  )

  const login = async (email: string, password: string) => {
    if (!settings.supabaseAuth.enabled) {
      throw new Error('Supabase auth is not enabled')
    }
    const { projectUrl, anonKey, allowedEmail } = settings.supabaseAuth
    if (!projectUrl || !anonKey) {
      throw new Error('Supabase auth is not configured')
    }

    const authUrl = new URL('/auth/v1/token?grant_type=password', projectUrl).toString()
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.user) {
      throw new Error(result?.error_description || result?.error || 'Supabase sign in failed')
    }

    const signedUser = result.user as User
    if (allowedEmail && signedUser.email !== allowedEmail) {
      throw new Error('User is not authorized to access this app')
    }

    setUser(signedUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedUser))
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return createElement(
    AuthContext.Provider,
    { value: { user, login, logout, authReady, authRequired } },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
