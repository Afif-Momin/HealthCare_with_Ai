import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  Pill, 
  Brain, 
  BookOpen, 
  Play, 
  MapPin, 
  Mail,
  Phone,
  Heart,
  Shield,
  AlertCircle,
  User,
  Clock,
  Activity,
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { patientsAPI } from '../services/api'

const PatientView = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
  }, [id])

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(id)
      setPatient(response.data)
    } catch (error) {
      console.error('Error fetching patient:', error)
      const errorMessage = error.response?.data?.message || 'Error loading patient'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading patient data...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
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
          <User size={36} color="var(--text-muted)" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Patient not found
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The patient you're looking for doesn't exist
        </p>
        <Link to="/patients" className="btn btn-primary">
          Back to Patients
        </Link>
      </div>
    )
  }

  const InfoItem = ({ label, value, icon: Icon }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.75rem 0',
    }}>
      {Icon && (
        <div style={{
          width: '32px',
          height: '32px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={14} color="var(--text-muted)" />
        </div>
      )}
      <div>
        <p style={{ 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}>
          {label}
        </p>
        <p style={{ 
          fontWeight: '500', 
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        }}>
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  )

  const quickActions = [
    { label: 'Medical Records', icon: FileText, path: `/medical-records?patientId=${id}`, color: '#00ff88' },
    { label: 'Appointments', icon: Calendar, path: `/appointments?patientId=${id}`, color: '#ffd700' },
    { label: 'Prescriptions', icon: Pill, path: `/prescriptions?patientId=${id}`, color: '#ff6b6b' },
    { label: 'AI Analyses', icon: Brain, path: `/ai-analysis?patientId=${id}`, color: '#00d4ff' },
  ]

  const advancedFeatures = [
    { 
      label: 'Predictive Timeline', 
      description: 'AI-powered health trajectory',
      icon: TrendingUp, 
      path: `/predictive-timeline/${id}`,
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    },
    { 
      label: 'Health Story', 
      description: 'Visual timeline & narrative',
      icon: BookOpen, 
      path: `/health-story/${id}`,
      gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    },
    { 
      label: 'What-If Simulator', 
      description: 'Simulate treatment outcomes',
      icon: Play, 
      path: `/what-if/${id}`,
      gradient: 'linear-gradient(135deg, #ff6b6b, #ffd700)',
    },
    { 
      label: 'Find Hospitals', 
      description: 'Nearest specialists',
      icon: MapPin, 
      path: `/hospitals/${id}`,
      gradient: 'linear-gradient(135deg, #00d4ff, #00ff88)',
    },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        <Link 
          to="/patients" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          Back to Patients
        </Link>

        {/* Patient Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 212, 255, 0.1))',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'white',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
            }}>
              {getInitials(patient.firstName, patient.lastName)}
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.25rem',
              }}>
                {patient.firstName} {patient.lastName}
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  <Activity size={14} />
                  ID: #{patient.id}
                </span>
                {patient.gender && (
                  <span className={`badge ${
                    patient.gender === 'MALE' ? 'badge-info' : 
                    patient.gender === 'FEMALE' ? 'badge-purple' : 
                    'badge-warning'
                  }`}>
                    {patient.gender}
                  </span>
                )}
                {patient.bloodGroup && (
                  <span className="badge badge-danger">
                    <Heart size={10} />
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link 
            to={`/patients/${id}/edit`} 
            className="btn btn-primary"
            style={{ padding: '0.875rem 1.5rem' }}
          >
            <Edit size={18} />
            Edit Patient
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Personal Information */}
        <div 
          className="card"
          style={{
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.1s',
            opacity: 0,
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'rgba(124, 58, 237, 0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={18} color="#a78bfa" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Personal Information</h3>
          </div>

          <InfoItem label="Email" value={patient.email} icon={Mail} />
          <InfoItem label="Phone" value={patient.phoneNumber} icon={Phone} />
          <InfoItem label="Date of Birth" value={patient.dateOfBirth} icon={Calendar} />
        </div>

        {/* Address */}
        <div 
          className="card"
          style={{
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'rgba(0, 255, 136, 0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MapPin size={18} color="#00ff88" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Address</h3>
          </div>

          <InfoItem label="Street" value={patient.address} />
          <InfoItem label="City" value={patient.city} />
          <InfoItem label="State" value={patient.state} />
          <InfoItem label="Country" value={patient.country} />
        </div>

        {/* Allergies */}
        {patient.allergies && (
          <div 
            className="card"
            style={{
              animation: 'fadeInUp 0.5s ease forwards',
              animationDelay: '0.3s',
              opacity: 0,
              borderColor: 'rgba(255, 107, 107, 0.3)',
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255, 107, 107, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircle size={18} color="#ff6b6b" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Allergies</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {patient.allergies}
            </p>
          </div>
        )}

        {/* Medical History */}
        {patient.medicalHistory && (
          <div 
            className="card"
            style={{
              animation: 'fadeInUp 0.5s ease forwards',
              animationDelay: '0.4s',
              opacity: 0,
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(0, 212, 255, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={18} color="#00d4ff" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Medical History</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {patient.medicalHistory}
            </p>
          </div>
        )}

        {/* Emergency Contact */}
        {patient.emergencyContactName && (
          <div 
            className="card"
            style={{
              animation: 'fadeInUp 0.5s ease forwards',
              animationDelay: '0.5s',
              opacity: 0,
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255, 215, 0, 0.15)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={18} color="#ffd700" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Emergency Contact</h3>
            </div>
            <InfoItem label="Name" value={patient.emergencyContactName} icon={User} />
            <InfoItem label="Phone" value={patient.emergencyContactPhone} icon={Phone} />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div 
        className="card"
        style={{
          marginBottom: '1.5rem',
          animation: 'fadeInUp 0.5s ease forwards',
          animationDelay: '0.6s',
          opacity: 0,
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Quick Actions</h3>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1rem' 
        }}>
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link 
                key={action.label}
                to={action.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.boxShadow = `0 0 20px ${action.color}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${action.color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={action.color} />
                </div>
                <span style={{ 
                  fontWeight: '500', 
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}>
                  {action.label}
                </span>
                <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Advanced Features */}
      <div 
        style={{
          animation: 'fadeInUp 0.5s ease forwards',
          animationDelay: '0.7s',
          opacity: 0,
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <Brain size={20} color="var(--accent-secondary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Advanced AI Features</h3>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem' 
        }}>
          {advancedFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Link 
                key={feature.label}
                to={feature.path}
                style={{
                  padding: '1.5rem',
                  background: feature.gradient,
                  borderRadius: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Icon size={26} color="white" />
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1.1rem',
                    color: 'white',
                    marginBottom: '0.25rem',
                  }}>
                    {feature.label}
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255,255,255,0.8)' 
                  }}>
                    {feature.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PatientView
