import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

/**
 * Resolves the data-scope for the currently logged-in user.
 *
 * Non-patient roles (ADMIN, DOCTOR, NURSE):
 *   - filterPatientId = null  → load ALL records
 *   - ready = true immediately
 *
 * PATIENT role:
 *   - ready = false while looking up their Patient row ID
 *   - once resolved, filterPatientId = <Patient.id> (loads only their records)
 *   - if no Patient row is linked, filterPatientId = -1 (loads nothing, safe)
 *
 * Usage:
 *   const { filterPatientId, ready, isPatient, canCreate } = usePatientScope()
 */
export function usePatientId() {
  const { user } = useAuth()
  const isPatient = user?.role === 'PATIENT'

  // For non-patients: immediately ready, no filter
  const [filterPatientId, setFilterPatientId] = useState(isPatient ? undefined : null)
  const [ready, setReady] = useState(!isPatient)

  useEffect(() => {
    if (!isPatient) {
      // Admin / Doctor / Nurse — load everything
      setFilterPatientId(null)
      setReady(true)
      return
    }

    // Patient — resolve their Patient table ID
    setReady(false)

    const cacheKey = `pid_${user.email}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      setFilterPatientId(Number(cached))
      setReady(true)
      return
    }

    authAPI.getPatientId(user.email)
      .then(res => {
        const pid = res.data?.patientId
        if (pid) {
          sessionStorage.setItem(cacheKey, String(pid))
          setFilterPatientId(Number(pid))
        } else {
          // No linked Patient row — use -1 so the query returns nothing
          setFilterPatientId(-1)
        }
      })
      .catch(() => setFilterPatientId(-1))
      .finally(() => setReady(true))
  }, [user?.email, isPatient])

  // Role-specific write permissions
  const role = user?.role
  const canCreate = role === 'ADMIN' || role === 'DOCTOR'
  const canManageAppointments = role === 'ADMIN' || role === 'DOCTOR' || role === 'NURSE'
  const canModify = !isPatient // generic: non-patients can see write buttons

  return { filterPatientId, ready, isPatient, canModify, canCreate, canManageAppointments }
}
