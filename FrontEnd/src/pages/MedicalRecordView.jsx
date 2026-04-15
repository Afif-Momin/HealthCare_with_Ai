import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { medicalRecordsAPI } from '../services/api'
import { formatDateTime } from '../utils/dateUtils'

const MedicalRecordView = () => {
  const { id } = useParams()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecord()
  }, [id])

  const fetchRecord = async () => {
    try {
      const response = await medicalRecordsAPI.getById(id)
      setRecord(response.data)
    } catch (error) {
      console.error('Error fetching record:', error)
      const errorMessage = error.response?.data?.message || 'Error loading record'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="card">
        <p>Record not found</p>
        <Link to="/medical-records" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Records
        </Link>
      </div>
    )
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {record.title}
            </h1>
            <p style={{ color: 'var(--text-light)' }}>
              <span className="badge badge-info">{record.recordType}</span>
            </p>
          </div>
          <Link to={`/medical-records/${id}/edit`} className="btn btn-primary">
            <Edit size={18} />
            Edit Record
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Patient Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Patient</span>
              <p style={{ fontWeight: '500' }}>{record.patientName}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Record Date</span>
              <p style={{ fontWeight: '500' }}>{formatDateTime(record.recordDate)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Medical Professional
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Doctor</span>
              <p style={{ fontWeight: '500' }}>{record.doctorName || '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Hospital</span>
              <p style={{ fontWeight: '500' }}>{record.hospitalName || '-'}</p>
            </div>
          </div>
        </div>

        {record.description && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Description
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{record.description}</p>
          </div>
        )}

        {record.symptoms && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Symptoms
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{record.symptoms}</p>
          </div>
        )}

        {record.diagnosis && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Diagnosis
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{record.diagnosis}</p>
          </div>
        )}

        {record.treatment && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Treatment
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{record.treatment}</p>
          </div>
        )}

        {record.notes && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Notes
            </h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{record.notes}</p>
          </div>
        )}

        {record.fileUrl && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Attached File
            </h3>
            <a 
              href={record.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View File
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalRecordView

