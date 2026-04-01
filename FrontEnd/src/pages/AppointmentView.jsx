import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { appointmentsAPI } from '../services/api'
import { formatDateTime } from '../utils/dateUtils'

const AppointmentView = () => {
  const { id } = useParams()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const fetchAppointment = async () => {
    try {
      const response = await appointmentsAPI.getById(id)
      setAppointment(response.data)
    } catch (error) {
      console.error('Error fetching appointment:', error)
      const errorMessage = error.response?.data?.message || 'Error loading appointment'
      alert(errorMessage)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="card">
        <p>Appointment not found</p>
        <Link to="/appointments" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Appointments
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/appointments" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-light)',
            textDecoration: 'none',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={18} />
          Back to Appointments
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Appointment Details
            </h1>
            <p style={{ color: 'var(--text-light)' }}>
              <span className={`badge ${getStatusBadge(appointment.status)}`}>
                {appointment.status}
              </span>
            </p>
          </div>
          <Link to={`/appointments/${id}/edit`} className="btn btn-primary">
            <Edit size={18} />
            Edit Appointment
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Patient Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Patient</span>
              <p style={{ fontWeight: '500' }}>{appointment.patientName}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Appointment Details
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Date & Time</span>
              <p style={{ fontWeight: '500' }}>{formatDateTime(appointment.appointmentDate)}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Doctor</span>
              <p style={{ fontWeight: '500' }}>{appointment.doctorName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Department</span>
              <p style={{ fontWeight: '500' }}>{appointment.department}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Location</span>
              <p style={{ fontWeight: '500' }}>{appointment.location || '-'}</p>
            </div>
          </div>
        </div>

        {appointment.reason && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Reason
            </h3>
            <p>{appointment.reason}</p>
          </div>
        )}

        {appointment.notes && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Notes
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentView

