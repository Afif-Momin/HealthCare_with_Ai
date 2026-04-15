import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { prescriptionsAPI } from '../services/api'
import { formatDate } from '../utils/dateUtils'

const PrescriptionView = () => {
  const { id } = useParams()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescription()
  }, [id])

  const fetchPrescription = async () => {
    try {
      const response = await prescriptionsAPI.getById(id)
      setPrescription(response.data)
    } catch (error) {
      console.error('Error fetching prescription:', error)
      const errorMessage = error.response?.data?.message || 'Error loading prescription'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'badge-success',
      COMPLETED: 'badge-info',
      CANCELLED: 'badge-danger',
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

  if (!prescription) {
    return (
      <div className="card">
        <p>Prescription not found</p>
        <Link to="/prescriptions" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Prescriptions
        </Link>
      </div>
    )
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {prescription.medicationName}
            </h1>
            <p style={{ color: 'var(--text-light)' }}>
              <span className={`badge ${getStatusBadge(prescription.status)}`}>
                {prescription.status}
              </span>
            </p>
          </div>
          <Link to={`/prescriptions/${id}/edit`} className="btn btn-primary">
            <Edit size={18} />
            Edit Prescription
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
              <p style={{ fontWeight: '500' }}>{prescription.patientName}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Medication Details
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Medication</span>
              <p style={{ fontWeight: '500' }}>{prescription.medicationName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Dosage</span>
              <p style={{ fontWeight: '500' }}>{prescription.dosage}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Frequency</span>
              <p style={{ fontWeight: '500' }}>{prescription.frequency}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Doctor</span>
              <p style={{ fontWeight: '500' }}>{prescription.doctorName || '-'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Duration
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Start Date</span>
              <p style={{ fontWeight: '500' }}>{formatDate(prescription.startDate)}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>End Date</span>
              <p style={{ fontWeight: '500' }}>{formatDate(prescription.endDate)}</p>
            </div>
          </div>
        </div>

        {prescription.instructions && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Instructions
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{prescription.instructions}</p>
          </div>
        )}

        {prescription.notes && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Notes
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{prescription.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrescriptionView

