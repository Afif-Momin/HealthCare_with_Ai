import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { medicalRecordsAPI, patientsAPI } from '../services/api'
import { formatDateTimeInput } from '../utils/dateUtils'

const MedicalRecordForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: searchParams.get('patientId') || '',
    recordType: '',
    title: '',
    description: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    doctorName: '',
    hospitalName: '',
    fileUrl: '',
    recordDate: new Date().toISOString().slice(0, 16),
  })

  useEffect(() => {
    fetchPatients()
    if (isEdit && id) {
      fetchRecord()
    }
  }, [id, isEdit])

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const fetchRecord = async () => {
    try {
      const response = await medicalRecordsAPI.getById(id)
      const record = response.data
      setFormData({
        patientId: record.patientId,
        recordType: record.recordType || '',
        title: record.title || '',
        description: record.description || '',
        diagnosis: record.diagnosis || '',
        symptoms: record.symptoms || '',
        treatment: record.treatment || '',
        notes: record.notes || '',
        doctorName: record.doctorName || '',
        hospitalName: record.hospitalName || '',
        fileUrl: record.fileUrl || '',
        recordDate: record.recordDate ? formatDateTimeInput(record.recordDate) : formatDateTimeInput(new Date().toISOString()),
      })
    } catch (error) {
      console.error('Error fetching record:', error)
      alert('Error loading record')
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
        recordDate: formData.recordDate ? new Date(formData.recordDate).toISOString() : new Date().toISOString(),
      }
      if (isEdit) {
        await medicalRecordsAPI.update(id, submitData)
      } else {
        await medicalRecordsAPI.create(submitData)
      }
      navigate('/medical-records')
    } catch (error) {
      let errorMessage = 'Error saving record'
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
          to="/medical-records" 
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
          Back to Records
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {isEdit ? 'Edit Medical Record' : 'Add New Medical Record'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
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
              <label className="form-label">Record Type *</label>
              <select
                name="recordType"
                value={formData.recordType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Type</option>
                <optgroup label="Imaging & Scans">
                  <option value="MRI">MRI</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Ultrasound">Ultrasound</option>
                </optgroup>
                <optgroup label="Cardiac Tests">
                  <option value="ECG">ECG</option>
                  <option value="Echocardiogram">Echocardiogram</option>
                  <option value="Stress Test">Stress Test</option>
                </optgroup>
                <optgroup label="Lab Reports">
                  <option value="Blood Report">Blood Report</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Urine Test">Urine Test</option>
                  <option value="Biopsy">Biopsy</option>
                </optgroup>
                <optgroup label="Clinical Records">
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Consultation">Consultation</option>
                </optgroup>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
              <label className="form-label">Hospital Name</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Record Date</label>
              <input
                type="datetime-local"
                name="recordDate"
                value={formData.recordDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Treatment</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
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

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">File URL</label>
              <input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/file.pdf"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Link to="/medical-records" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : isEdit ? 'Update Record' : 'Create Record'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicalRecordForm

