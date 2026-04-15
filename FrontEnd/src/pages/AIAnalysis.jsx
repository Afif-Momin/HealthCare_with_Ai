import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Eye, 
  Trash2, 
  Brain, 
  Mic, 
  Sparkles,
  Activity,
  Search,
  Filter,
  ChevronDown,
  Zap,
  Clock,
  User,
  TrendingUp
} from 'lucide-react'
import { aiAnalysisAPI } from '../services/api'
import { formatDate, formatDateTime } from '../utils/dateUtils'

const AIAnalysis = () => {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')

  useEffect(() => {
    fetchAnalyses()
  }, [patientId])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      const response = await aiAnalysisAPI.getAll(patientId ? parseInt(patientId) : undefined)
      setAnalyses(response.data)
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this AI analysis?')) {
      try {
        await aiAnalysisAPI.delete(id)
        fetchAnalyses()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting analysis'
        alert(errorMessage)
        console.error(error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      PROCESSING: 'badge-info',
      COMPLETED: 'badge-success',
      FAILED: 'badge-danger',
    }
    return badges[status] || 'badge-info'
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#ffd700',
      PROCESSING: '#00d4ff',
      COMPLETED: '#00ff88',
      FAILED: '#ff6b6b',
    }
    return colors[status] || '#00d4ff'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading AI analyses...</p>
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
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
            }}>
              <Brain size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800',
                marginBottom: '0.125rem',
              }}>
                AI Analysis
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem' 
              }}>
                {patientId ? 'Patient AI analyses' : 'AI-powered medical insights'}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            to="/voice-consultation" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.25rem',
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(124, 58, 237, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.3)'
            }}
          >
            <Mic size={18} />
            Voice Consultation
          </Link>
          <Link 
            to="/ai-analysis/new" 
            className="btn btn-primary"
            style={{ padding: '0.875rem 1.5rem' }}
          >
            <Plus size={18} />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '0.1s',
        opacity: 0,
      }}>
        {[
          { label: 'Total Analyses', value: analyses.length, icon: Brain, color: '#00d4ff' },
          { label: 'Completed', value: analyses.filter(a => a.status === 'COMPLETED').length, icon: TrendingUp, color: '#00ff88' },
          { label: 'Processing', value: analyses.filter(a => a.status === 'PROCESSING').length, icon: Activity, color: '#ffd700' },
          { label: 'Pending', value: analyses.filter(a => a.status === 'PENDING').length, icon: Clock, color: '#a78bfa' },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={stat.label}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                background: `${stat.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={stat.color} />
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.125rem',
                }}>
                  {stat.label}
                </p>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: stat.color,
                }}>
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content */}
      {analyses.length === 0 ? (
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
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Brain size={48} color="var(--accent-primary)" />
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}>
            No AI Analyses Found
          </h3>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
          }}>
            Start leveraging AI to gain deeper insights into patient health data
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/ai-analysis/new" className="btn btn-primary">
              <Sparkles size={18} />
              Create First Analysis
            </Link>
            <Link to="/voice-consultation" className="btn btn-outline">
              <Mic size={18} />
              Try Voice AI
            </Link>
          </div>
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
                <th>Analysis Type</th>
                <th>Status</th>
                <th>Confidence</th>
                <th>Created</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis, index) => (
                <tr 
                  key={analysis.id}
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
                      <span style={{ fontWeight: '500' }}>{analysis.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.75rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}>
                      <Zap size={14} color="var(--accent-primary)" />
                      {analysis.analysisType}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(analysis.status)}`}>
                      {analysis.status}
                    </span>
                  </td>
                  <td>
                    {analysis.confidenceScore ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${analysis.confidenceScore}%`,
                            height: '100%',
                            background: analysis.confidenceScore >= 80 ? '#00ff88' : 
                                       analysis.confidenceScore >= 60 ? '#ffd700' : '#ff6b6b',
                            borderRadius: '3px',
                          }} />
                        </div>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {analysis.confidenceScore}%
                        </span>
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
                      fontSize: '0.85rem',
                    }}>
                      <Clock size={14} color="var(--text-muted)" />
                      {formatDate(analysis.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}>
                      <Link 
                        to={`/ai-analysis/${analysis.id}`}
                        className="btn btn-ghost"
                        title="View analysis"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        className="btn btn-ghost"
                        title="Delete analysis"
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

export default AIAnalysis
