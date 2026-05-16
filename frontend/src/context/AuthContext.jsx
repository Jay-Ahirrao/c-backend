import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/users/current-user')
      setUser(data.data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const { data } = await api.post('/users/login', credentials)
    setUser(data.data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  }

  const logout = async () => {
    await api.post('/users/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
