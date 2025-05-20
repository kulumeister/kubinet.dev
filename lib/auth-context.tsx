"use client"

import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from './supabase'

type AuthContextType = {
  isAuthenticated: boolean
  userId: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  loading: true
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
        setUserId(session?.user?.id || null)
      } catch (error) {
        console.error('Oturum bilgisi alınamadı:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUserId(session?.user?.id || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, loading }}>
      {children}
    </AuthContext.Provider>
  )
} 