import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Pill,
  User,
  Clock,
  Calendar,
  Activity,
  Repeat,
  Package
} from 'lucide-react'
import { prescriptionsAPI } from '../services/api'
import { formatDate } from '../utils/dateUtils'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')

  useEffect(() => {
    fetchPrescriptions()
  }, [patientId])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await prescriptionsAPI.getAll(patientId ? parseInt(patientId) : undefined)
      setPrescriptions(response.data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionsAPI.delete(id)
        fetchPrescriptions()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting prescription'
        alert(errorMessage)
        console.error(error)
      }
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

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#00ff88',
      COMPLETED: '#00d4ff',
      CANCELLED: '#ff6b6b',
    }
    return colors[status] || '#00d4ff'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading prescriptions...</p>
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
              background: 'linear-gradient(135deg, #ff6b6b, #ff8a8a)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
            }}>
              <Pill size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.125rem',
              }}>
                Prescriptions
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                {patientId ? 'Patient prescriptions' : 'Manage all prescriptions'}
              </p>
            </div>
          </div>
        </div>
        
        <Link 
          to="/prescriptions/new" 
          className="btn btn-primary"
          style={{ padding: '0.875rem 1.5rem' }}
        >
          <Plus size={18} />
          Create Prescription
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        {[
          { label: 'Total', value: prescriptions.length, color: '#00d4ff', icon: Package },
          { label: 'Active', value: prescriptions.filter(p => p.status === 'ACTIVE').length, color: '#00ff88', icon: Activity },
          { label: 'Completed', value: prescriptions.filter(p => p.status === 'COMPLETED').length, color: '#a78bfa', icon: Clock },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div 
              key={stat.label}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: stat.color }}>{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content */}
      {prescriptions.length === 0 ? (
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
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 138, 138, 0.1))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Pill size={36} color="#ff6b6b" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Prescriptions Found
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            Create your first prescription to get started
          </p>
          <Link to="/prescriptions/new" className="btn btn-primary">
            <Plus size={18} />
            Create First Prescription
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
                <th>Patient</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription, index) => (
                <tr 
                  key={prescription.id}
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
                      <span style={{ fontWeight: '500' }}>{prescription.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Pill size={14} color="#ff6b6b" />
                      <span style={{ fontWeight: '500' }}>{prescription.medicationName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {prescription.dosage}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Repeat size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.9rem' }}>{prescription.frequency}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '0.25rem',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={12} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(prescription.startDate)}
                        </span>
                      </div>
                      {prescription.endDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>→</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(prescription.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}>
                      <Link 
                        to={`/prescriptions/${prescription.id}`}
                        className="btn btn-ghost"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        to={`/prescriptions/${prescription.id}/edit`}
                        className="btn btn-ghost"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prescription.id)}
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

export default Prescriptions
