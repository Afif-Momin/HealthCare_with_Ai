import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { prescriptionsAPI, patientsAPI } from '../services/api'
import { formatDateInput } from '../utils/dateUtils'

const PrescriptionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    instructions: '',
    doctorName: '',
    notes: '',
    status: 'ACTIVE',
  })

  useEffect(() => {
    fetchPatients()
    if (isEdit && id) {
      fetchPrescription()
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

  const fetchPrescription = async () => {
    try {
      const response = await prescriptionsAPI.getById(id)
      const prescription = response.data
      setFormData({
        patientId: prescription.patientId,
        medicationName: prescription.medicationName || '',
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || '',
        startDate: formatDateInput(prescription.startDate) || formatDateInput(new Date().toISOString()),
        endDate: formatDateInput(prescription.endDate) || formatDateInput(new Date().toISOString()),
        instructions: prescription.instructions || '',
        doctorName: prescription.doctorName || '',
        notes: prescription.notes || '',
        status: prescription.status || 'ACTIVE',
      })
    } catch (error) {
      console.error('Error fetching prescription:', error)
      alert('Error loading prescription')
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
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date().toISOString().split('T')[0],
        status: formData.status || 'ACTIVE',
      }
      if (isEdit) {
        await prescriptionsAPI.update(id, submitData)
      } else {
        await prescriptionsAPI.create(submitData)
      }
      navigate('/prescriptions')
    } catch (error) {
      let errorMessage = 'Error saving prescription'
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
          to="/prescriptions" 
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
          Back to Prescriptions
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {isEdit ? 'Edit Prescription' : 'Create New Prescription'}
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
            <label className="form-label">Medication Name *</label>
            <input
              type="text"
              name="medicationName"
              value={formData.medicationName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dosage *</label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g., 500mg, 10ml"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Frequency *</label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="e.g., Twice daily, Once a day"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Name</label>
            <input
              type="text"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="form-input"
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
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="e.g., Take with food"
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
          <Link to="/prescriptions" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : isEdit ? 'Update Prescription' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PrescriptionForm

