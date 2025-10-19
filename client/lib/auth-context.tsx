"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser, isAuthenticated, logout as cognitoLogout } from '../app/(auth)/cognito'

interface User {
  username: string
  attributes: Record<string, string>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  authenticated: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  const login = (userData: User) => {
    setUser(userData)
    setAuthenticated(true)
  }

  const logout = async () => {
    try {
      await cognitoLogout()
      setUser(null)
      setAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if Cognito logout fails
      setUser(null)
      setAuthenticated(false)
    }
  }

  const checkAuth = async () => {
    try {
      setLoading(true)
      const isAuth = await isAuthenticated()
      
      if (isAuth) {
        const userData = await getUser()
        setUser(userData)
        setAuthenticated(true)
      } else {
        setUser(null)
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    authenticated,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
