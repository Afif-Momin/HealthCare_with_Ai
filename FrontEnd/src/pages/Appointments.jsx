import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
  Activity,
  CalendarPlus,
  Lock
} from 'lucide-react'
import { appointmentsAPI } from '../services/api'
import { formatDateTime } from '../utils/dateUtils'
import { usePatientId } from '../hooks/usePatientId'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const urlPatientId = searchParams.get('patientId')

  const { patientId: myPatientId, loading: pidLoading, isPatient, canModify } = usePatientId()
  const effectivePatientId = isPatient ? myPatientId : (urlPatientId ? parseInt(urlPatientId) : undefined)

  useEffect(() => {
    if (isPatient && pidLoading) return
    fetchAppointments()
  }, [effectivePatientId, pidLoading])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentsAPI.getAll(effectivePatientId)
      setAppointments(response.data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsAPI.delete(id)
        fetchAppointments()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting appointment'
        alert(errorMessage)
        console.error(error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: 'badge-info',
      CONFIRMED: 'badge-success',
      IN_PROGRESS: 'badge-warning',
      COMPLETED: 'badge-success',
      CANCELLED: 'badge-danger',
      NO_SHOW: 'badge-danger',
    }
    return badges[status] || 'badge-info'
  }

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: '#00d4ff',
      CONFIRMED: '#00ff88',
      IN_PROGRESS: '#ffd700',
      COMPLETED: '#00ff88',
      CANCELLED: '#ff6b6b',
      NO_SHOW: '#ff6b6b',
    }
    return colors[status] || '#00d4ff'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #ffd700, #ff6b6b)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
            }}>
              <Calendar size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.125rem',
              }}>
                Appointments
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                {patientId ? 'Patient appointments' : 'Manage all appointments'}
              </p>
            </div>
          </div>
        </div>
        
        {canModify && (
          <Link 
            to="/appointments/new" 
            className="btn btn-primary"
            style={{ padding: '0.875rem 1.5rem' }}
          >
            <CalendarPlus size={18} />
            Schedule Appointment
          </Link>
        )}
        {isPatient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '10px', fontSize: '0.82rem', color: '#ffd700' }}>
            <Lock size={14} /> Your appointments only
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        {[
          { label: 'Total', value: appointments.length, color: '#00d4ff' },
          { label: 'Scheduled', value: appointments.filter(a => a.status === 'SCHEDULED').length, color: '#00d4ff' },
          { label: 'Confirmed', value: appointments.filter(a => a.status === 'CONFIRMED').length, color: '#00ff88' },
          { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length, color: '#a78bfa' },
        ].map((stat) => (
          <div 
            key={stat.label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</span>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: stat.color,
            }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      {appointments.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 107, 0.1))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Calendar size={36} color="#ffd700" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Appointments Found
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            Schedule your first appointment to get started
          </p>
          {canModify && (
            <Link to="/appointments/new" className="btn btn-primary">
              <CalendarPlus size={18} />
              Schedule First Appointment
            </Link>
          )}
        </div>
      ) : (
        <div 
          className="table-container"
          style={{
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr 
                  key={appointment.id}
                  style={{
                    animation: 'fadeInUp 0.3s ease forwards',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <User size={16} color="white" />
                      </div>
                      <span style={{ fontWeight: '500' }}>{appointment.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Stethoscope size={14} color="var(--text-muted)" />
                      <span>{appointment.doctorName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={14} color="var(--text-muted)" />
                      <span>{appointment.department}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: 'var(--text-secondary)',
                    }}>
                      <Clock size={14} color="var(--text-muted)" />
                      {formatDateTime(appointment.appointmentDate)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}>
                      <Link 
                        to={`/appointments/${appointment.id}`}
                        className="btn btn-ghost"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      {canModify && (
                        <>
                          <Link 
                            to={`/appointments/${appointment.id}/edit`}
                            className="btn btn-ghost"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="btn btn-ghost"
                            title="Delete"
                            style={{ color: 'var(--accent-warm)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Appointments
