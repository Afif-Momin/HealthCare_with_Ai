import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { appointmentsAPI, patientsAPI } from '../services/api'
import { formatDateTimeInput } from '../utils/dateUtils'

const AppointmentForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    doctorName: '',
    department: '',
    appointmentDate: new Date().toISOString().slice(0, 16),
    status: 'SCHEDULED',
    reason: '',
    notes: '',
    location: '',
  })

  useEffect(() => {
    fetchPatients()
    if (isEdit && id) {
      fetchAppointment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchAppointment = async () => {
    try {
      const response = await appointmentsAPI.getById(id)
      const appointment = response.data
      setFormData({
        patientId: appointment.patientId,
        doctorName: appointment.doctorName || '',
        department: appointment.department || '',
        appointmentDate: appointment.appointmentDate ? formatDateTimeInput(appointment.appointmentDate) : formatDateTimeInput(new Date().toISOString()),
        status: appointment.status || 'SCHEDULED',
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        location: appointment.location || '',
      })
    } catch (error) {
      console.error('Error fetching appointment:', error)
      alert('Error loading appointment')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const submitData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate).toISOString() : new Date().toISOString(),
        status: formData.status || 'SCHEDULED',
      }
      if (isEdit) {
        await appointmentsAPI.update(id, submitData)
      } else {
        await appointmentsAPI.create(submitData)
      }
      navigate('/appointments')
    } catch (error) {
      let errorMessage = 'Error saving appointment'
      if (error.response?.data?.errors) {
        const errors = Object.entries(error.response.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n')
        errorMessage = `Validation errors:\n${errors}`
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      alert(errorMessage)
      console.error(error)
    } finally {
      setLoading(false)
    }
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
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="form-select"
              required
              disabled={isEdit}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g., Cardiology, Neurology"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Appointment Date & Time *</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Room 101, Building A"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="form-input"
              placeholder="Reason for appointment"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Link to="/appointments" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : isEdit ? 'Update Appointment' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentForm

