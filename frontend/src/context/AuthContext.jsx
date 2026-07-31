import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setAccessToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessTokenState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const refreshRes = await api.post('/auth/refresh')
        const token = refreshRes.data.accessToken
        const meRes = await api.get('/auth/me', undefined, { token })
        if (cancelled) return
        setAccessToken(token)
        setAccessTokenState(token)
        setUser(meRes.data.user ?? meRes.data)
      } catch {
        if (cancelled) return
        setAccessToken(null)
        setAccessTokenState(null)
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password, rememberMe, twoFactorCode) => {
    const res = await api.post('/auth/login', { email, password, rememberMe, twoFactorCode })
    if (res.data.twoFactorRequired) {
      return { twoFactorRequired: true }
    }
    setAccessToken(res.data.accessToken)
    setAccessTokenState(res.data.accessToken)
    setUser(res.data.user)
    return { user: res.data.user }
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    setAccessToken(res.data.accessToken)
    setAccessTokenState(res.data.accessToken)
    setUser(res.data.user)
    return { user: res.data.user }
  }, [])

  const googleLogin = useCallback(async (idToken) => {
    const res = await api.post('/auth/google', { idToken })
    setAccessToken(res.data.accessToken)
    setAccessTokenState(res.data.accessToken)
    setUser(res.data.user)
    return { user: res.data.user, isNewUser: res.data.isNewUser }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort; clear local state regardless
    }
    setAccessToken(null)
    setAccessTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
