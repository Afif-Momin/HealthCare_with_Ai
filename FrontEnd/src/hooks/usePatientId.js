import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

/**
 * For PATIENT role: resolves the Patient table ID from the patients table
 * using the logged-in user's email. Returns null for other roles.
 *
 * Usage:
 *   const { patientId, loading } = usePatientId()
 *   // patientId = number when found, null if no linked Patient row
 */
export function usePatientId() {
  const { user } = useAuth()
  const [patientId, setPatientId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'PATIENT') {
      setPatientId(null)
      setLoading(false)
      return
    }

    // Try cache first
    const cached = sessionStorage.getItem(`pid_${user.email}`)
    if (cached) {
      setPatientId(Number(cached))
      setLoading(false)
      return
    }

    authAPI.getPatientId(user.email)
      .then(res => {
        const pid = res.data.patientId
        if (pid) {
          sessionStorage.setItem(`pid_${user.email}`, String(pid))
          setPatientId(Number(pid))
        } else {
          setPatientId(null)
        }
      })
      .catch(() => setPatientId(null))
      .finally(() => setLoading(false))
  }, [user])

  const isPatient = user?.role === 'PATIENT'
  const canModify = !isPatient // patients are read-only

  return { patientId, loading, isPatient, canModify }
}
