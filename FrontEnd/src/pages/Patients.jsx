import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  Filter,
  ChevronDown,
  UserPlus,
  Activity,
  Calendar,
  Mail,
  Phone,
  MoreHorizontal
} from 'lucide-react'
import { patientsAPI } from '../services/api'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  useEffect(() => {
    fetchPatients()
  }, [searchTerm])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await patientsAPI.getAll(searchTerm || undefined)
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientsAPI.delete(id)
        fetchPatients()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting patient'
        alert(errorMessage)
        console.error(error)
      }
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #7c3aed, #a78bfa)',
      'linear-gradient(135deg, #00d4ff, #00ff88)',
      'linear-gradient(135deg, #ff6b6b, #ffd700)',
      'linear-gradient(135deg, #00ff88, #00d4ff)',
      'linear-gradient(135deg, #ffd700, #ff6b6b)',
    ]
    const index = (name?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading patients...</p>
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
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
            }}>
              <Users size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.125rem',
              }}>
                Patients
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                Manage and view all patient records
              </p>
            </div>
          </div>
        </div>
        
        <Link 
          to="/patients/new" 
          className="btn btn-primary"
          style={{ 
            padding: '0.875rem 1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <UserPlus size={18} />
          Add New Patient
        </Link>
      </div>

      {/* Search & Filters */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search Input */}
          <div style={{ 
            position: 'relative',
            flex: '1',
            minWidth: '250px',
          }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} 
            />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ 
                paddingLeft: '2.75rem',
                background: 'var(--bg-tertiary)',
              }}
            />
          </div>

          {/* Filter Button */}
          <button
            className="btn btn-outline"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} />
          </button>

          {/* Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
          }}>
            <Activity size={16} color="var(--accent-primary)" />
            <span style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)' 
            }}>
              <strong style={{ color: 'var(--accent-primary)' }}>{patients.length}</strong> patients
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      {patients.length === 0 ? (
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
            background: 'var(--bg-tertiary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Users size={36} color="var(--text-muted)" />
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}>
            No patients found
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Get started by adding your first patient'}
          </p>
          <Link to="/patients/new" className="btn btn-primary">
            <UserPlus size={18} />
            Add First Patient
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
                <th>Contact</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr 
                  key={patient.id}
                  style={{
                    animation: 'fadeInUp 0.3s ease forwards',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        background: getAvatarColor(patient.firstName),
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}>
                        {getInitials(patient.firstName, patient.lastName)}
                      </div>
                      <div>
                        <p style={{ 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          marginBottom: '0.125rem',
                        }}>
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--text-muted)' 
                        }}>
                          ID: #{patient.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {patient.email && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                        }}>
                          <Mail size={14} color="var(--text-muted)" />
                          {patient.email}
                        </div>
                      )}
                      {patient.phoneNumber && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                        }}>
                          <Phone size={14} color="var(--text-muted)" />
                          {patient.phoneNumber}
                        </div>
                      )}
                      {!patient.email && !patient.phoneNumber && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {patient.dateOfBirth ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                      }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    {patient.gender ? (
                      <span className={`badge ${
                        patient.gender === 'MALE' ? 'badge-info' : 
                        patient.gender === 'FEMALE' ? 'badge-purple' : 
                        'badge-warning'
                      }`}>
                        {patient.gender}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}>
                      <Link 
                        to={`/patients/${patient.id}`}
                        className="btn btn-ghost"
                        title="View details"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        to={`/patients/${patient.id}/edit`}
                        className="btn btn-ghost"
                        title="Edit patient"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="btn btn-ghost"
                        title="Delete patient"
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

export default Patients
