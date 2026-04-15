import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  User,
  Stethoscope,
  Clock,
  FolderOpen,
  FilePlus
} from 'lucide-react'
import { medicalRecordsAPI } from '../services/api'
import { formatDate } from '../utils/dateUtils'

const MedicalRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')

  useEffect(() => {
    fetchRecords()
  }, [patientId])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await medicalRecordsAPI.getAll(patientId ? parseInt(patientId) : undefined)
      setRecords(response.data)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordsAPI.delete(id)
        fetchRecords()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting record'
        alert(errorMessage)
        console.error(error)
      }
    }
  }

  const getTypeColor = (type) => {
    const colors = {
      'LAB_RESULT': '#00d4ff',
      'IMAGING': '#7c3aed',
      'DIAGNOSIS': '#ff6b6b',
      'PROCEDURE': '#ffd700',
      'CONSULTATION': '#00ff88',
      'PRESCRIPTION': '#a78bfa',
    }
    return colors[type] || '#00d4ff'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading medical records...</p>
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
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
            }}>
              <FileText size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.125rem',
              }}>
                Medical Records
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                {patientId ? 'Patient medical records' : 'All medical records'}
              </p>
            </div>
          </div>
        </div>
        
        <Link 
          to="/medical-records/new" 
          className="btn btn-primary"
          style={{ padding: '0.875rem 1.5rem' }}
        >
          <FilePlus size={18} />
          Add Record
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        <FolderOpen size={18} color="var(--accent-tertiary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-tertiary)' }}>{records.length}</strong> medical records
        </span>
      </div>

      {/* Content */}
      {records.length === 0 ? (
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
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.1))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <FileText size={36} color="#00ff88" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Medical Records Found
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            Add your first medical record to get started
          </p>
          <Link to="/medical-records/new" className="btn btn-primary">
            <FilePlus size={18} />
            Add First Record
          </Link>
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
                <th>Title</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Doctor</th>
                <th>Date</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr 
                  key={record.id}
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
                        background: `${getTypeColor(record.recordType)}15`,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <FileText size={16} color={getTypeColor(record.recordType)} />
                      </div>
                      <span style={{ fontWeight: '500' }}>{record.title}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      <span>{record.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: `${getTypeColor(record.recordType)}15`,
                        color: getTypeColor(record.recordType),
                        borderRadius: '100px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}
                    >
                      {record.recordType}
                    </span>
                  </td>
                  <td>
                    {record.doctorName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Stethoscope size={14} color="var(--text-muted)" />
                        <span>{record.doctorName}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                    }}>
                      <Clock size={14} color="var(--text-muted)" />
                      {formatDate(record.recordDate)}
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}>
                      <Link 
                        to={`/medical-records/${record.id}`}
                        className="btn btn-ghost"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        to={`/medical-records/${record.id}/edit`}
                        className="btn btn-ghost"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="btn btn-ghost"
                        title="Delete"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        <Trash2 size={16} />
                      </button>
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

export default MedicalRecords
