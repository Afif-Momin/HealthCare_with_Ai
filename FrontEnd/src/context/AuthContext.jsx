import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  PATIENT: 'PATIENT',
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  ADMIN: [
    '/', '/patients', '/medical-records', '/appointments', '/prescriptions',
    '/ai-analysis', '/advanced-detection', '/voice-consultation',
    '/population-intelligence', '/outbreak-detection', '/profile'
  ],
  DOCTOR: [
    '/', '/patients', '/medical-records', '/appointments', '/prescriptions',
    '/ai-analysis', '/advanced-detection', '/voice-consultation',
    '/population-intelligence', '/outbreak-detection', '/profile'
  ],
  NURSE: [
    '/', '/patients', '/medical-records', '/appointments', '/prescriptions', '/profile'
  ],
  PATIENT: [
    '/', '/medical-records', '/appointments', '/prescriptions', '/profile'
  ],
}

export const ROLE_SIDEBAR = {
  ADMIN: {
    main: [
      { path: '/', label: 'Dashboard' },
      { path: '/patients', label: 'Patients' },
      { path: '/medical-records', label: 'Records' },
      { path: '/appointments', label: 'Appointments' },
      { path: '/prescriptions', label: 'Prescriptions' },
      { path: '/ai-analysis', label: 'AI Analysis' },
    ],
    advanced: [
      { path: '/advanced-detection', label: 'Visual & Audio AI' },
      { path: '/voice-consultation', label: 'Voice AI' },
      { path: '/population-intelligence', label: 'Population' },
    ]
  },
  DOCTOR: {
    main: [
      { path: '/', label: 'Dashboard' },
      { path: '/patients', label: 'Patients' },
      { path: '/medical-records', label: 'Records' },
      { path: '/appointments', label: 'Appointments' },
      { path: '/prescriptions', label: 'Prescriptions' },
      { path: '/ai-analysis', label: 'AI Analysis' },
    ],
    advanced: [
      { path: '/advanced-detection', label: 'Visual & Audio AI' },
      { path: '/voice-consultation', label: 'Voice AI' },
      { path: '/population-intelligence', label: 'Population' },
    ]
  },
  NURSE: {
    main: [
      { path: '/', label: 'Dashboard' },
      { path: '/patients', label: 'Patients' },
      { path: '/medical-records', label: 'Records' },
      { path: '/appointments', label: 'Appointments' },
      { path: '/prescriptions', label: 'Prescriptions' },
    ],
    advanced: []
  },
  PATIENT: {
    main: [
      { path: '/', label: 'Dashboard' },
      { path: '/medical-records', label: 'My Records' },
      { path: '/appointments', label: 'My Appointments' },
      { path: '/prescriptions', label: 'My Prescriptions' },
    ],
    advanced: []
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore from localStorage
    try {
      const stored = localStorage.getItem('innovaition_user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      localStorage.removeItem('innovaition_user')
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('innovaition_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('innovaition_user')
  }

  const hasRole = (role) => user?.role === role

  const canAccess = (path) => {
    if (!user) return false
    const perms = ROLE_PERMISSIONS[user.role] || []
    // Check if any permission is a prefix of the path
    return perms.some(p => p === '/' ? path === '/' : path.startsWith(p))
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, canAccess, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
