import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mic, 
  Sparkles, 
  User,
  MessageSquare,
  Zap,
  Info
} from 'lucide-react'
import VoiceEnabledAIAnalysis from '../components/VoiceEnabledAIAnalysis'
import { patientsAPI } from '../services/api'

const VoiceConsultation = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [patientId, setPatientId] = useState(null)
  const [initialSymptoms, setInitialSymptoms] = useState('')
  const [patients, setPatients] = useState([])
  const [showPatientSelect, setShowPatientSelect] = useState(true)

  useEffect(() => {
    const patientIdParam = searchParams.get('patientId')
    const symptomsParam = searchParams.get('symptoms')
    
    if (patientIdParam) {
      setPatientId(parseInt(patientIdParam))
      setShowPatientSelect(false)
    }
    
    if (symptomsParam) {
      setInitialSymptoms(decodeURIComponent(symptomsParam))
    }

    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleComplete = (analysis) => {
    if (analysis && analysis.id) {
      navigate(`/ai-analysis/${analysis.id}`)
    }
  }

  if (showPatientSelect) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        <Link
          to="/ai-analysis"
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
          Back to AI Analysis
        </Link>

        {/* Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(124, 58, 237, 0.1))',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
          }}>
            <Mic size={36} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            marginBottom: '0.5rem',
          }}>
            Voice AI Consultation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Speak with our AI assistant for intelligent medical insights
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '2rem',
        }}>
          {/* Patient Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem', 
              fontWeight: '600', 
              fontSize: '0.9rem',
            }}>
              <User size={16} color="var(--accent-primary)" />
              Select Patient <span style={{ color: 'var(--accent-warm)' }}>*</span>
            </label>
            <select
              value={patientId || ''}
              onChange={(e) => setPatientId(parseInt(e.target.value))}
              className="form-select"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Symptoms Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem', 
              fontWeight: '600', 
              fontSize: '0.9rem',
            }}>
              <MessageSquare size={16} color="var(--accent-tertiary)" />
              Initial Symptoms <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional)</span>
            </label>
            <textarea
              value={initialSymptoms}
              onChange={(e) => setInitialSymptoms(e.target.value)}
              placeholder="Describe symptoms or leave blank to start with voice..."
              rows="4"
              className="form-textarea"
            />
          </div>

          {/* Start Button */}
          <button
            onClick={() => setShowPatientSelect(false)}
            disabled={!patientId}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: patientId 
                ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' 
                : 'var(--bg-tertiary)',
              color: patientId ? 'white' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: patientId ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              boxShadow: patientId ? '0 4px 20px rgba(124, 58, 237, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (patientId) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(124, 58, 237, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (patientId) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)'
              }
            }}
          >
            <Mic size={20} />
            Start Voice Consultation
          </button>

          {/* Info Box */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            gap: '0.75rem',
          }}>
            <Info size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}>
                <strong style={{ color: 'var(--accent-primary)' }}>Tip:</strong> Allow microphone access when prompted. 
                Speak your symptoms and answer AI questions by voice, or use text input as a fallback.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginTop: '1.5rem',
        }}>
          {[
            { icon: Mic, label: 'Voice Input', color: '#a78bfa' },
            { icon: Sparkles, label: 'AI Analysis', color: '#00d4ff' },
            { icon: Zap, label: 'Instant Results', color: '#00ff88' },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <div 
                key={feature.label}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <Icon size={20} color={feature.color} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{feature.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/ai-analysis"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} />
          Back to AI Analysis
        </Link>
      </div>
      
      <VoiceEnabledAIAnalysis
        patientId={patientId}
        initialSymptoms={initialSymptoms}
        onComplete={handleComplete}
      />
    </div>
  )
}

export default VoiceConsultation
