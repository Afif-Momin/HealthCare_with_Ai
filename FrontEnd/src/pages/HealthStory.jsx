import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Activity,
  TrendingUp,
  Brain,
  Clock,
  BookOpen,
  Search,
  Filter,
  Download,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Stethoscope,
  Zap,
  User,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react'
import { healthStoryAPI, patientsAPI } from '../services/api'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const HealthStory = () => {
  const { patientId } = useParams()
  const [healthStory, setHealthStory] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState('timeline') // timeline, chart, narrative

  // Q&A State
  const [qaQuestion, setQaQuestion] = useState('')
  const [qaAnswer, setQaAnswer] = useState(null)
  const [qaLoading, setQaLoading] = useState(false)
  const [qaHistory, setQaHistory] = useState([])

  useEffect(() => {
    fetchData()
  }, [patientId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [storyResponse, patientResponse] = await Promise.all([
        healthStoryAPI.getByPatient(parseInt(patientId)),
        patientsAPI.getById(parseInt(patientId))
      ])
      setHealthStory(storyResponse.data)
      setPatient(patientResponse.data)
    } catch (error) {
      console.error('Error fetching health story:', error)
      setError('Failed to load health story')
    } finally {
      setLoading(false)
    }
  }

  // Handle Q&A submission
  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!qaQuestion.trim() || qaLoading) return

    const question = qaQuestion.trim()
    setQaLoading(true)
    setQaAnswer(null)

    try {
      const response = await healthStoryAPI.askQuestion(parseInt(patientId), question)
      const result = response.data

      if (result.success) {
        setQaAnswer(result)
        setQaHistory(prev => [...prev, { question, answer: result.answer, timestamp: new Date() }])
      } else {
        setQaAnswer({ success: false, error: result.error || 'Failed to get answer' })
      }
    } catch (error) {
      console.error('Error asking question:', error)
      setQaAnswer({ success: false, error: 'Failed to connect to AI service' })
    } finally {
      setQaLoading(false)
      setQaQuestion('')
    }
  }

  // Filter and search timeline events
  const filteredTimeline = useMemo(() => {
    if (!healthStory?.timeline) return []

    return healthStory.timeline.filter(event => {
      const matchesSearch = !searchQuery ||
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = filterType === 'all' ||
        (filterType === 'medical' && event.type === 'medical_record') ||
        (filterType === 'ai' && event.type === 'ai_analysis')

      return matchesSearch && matchesFilter
    })
  }, [healthStory?.timeline, searchQuery, filterType])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!healthStory?.timeline) return []

    const monthlyData = {}
    healthStory.timeline.forEach(event => {
      const date = new Date(event.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, medical: 0, ai: 0 }
      }
      if (event.type === 'medical_record') {
        monthlyData[monthKey].medical++
      } else if (event.type === 'ai_analysis') {
        monthlyData[monthKey].ai++
      }
    })

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  }, [healthStory?.timeline])

  // Risk distribution data
  const riskDistribution = useMemo(() => {
    if (!healthStory?.timeline) return []

    const risks = { HIGH: 0, MODERATE: 0, LOW: 0, UNKNOWN: 0 }
    healthStory.timeline.forEach(event => {
      const risk = event.riskLevel || 'UNKNOWN'
      risks[risk] = (risks[risk] || 0) + 1
    })

    return Object.entries(risks)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }))
  }, [healthStory?.timeline])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEventIcon = (type) => {
    if (type === 'ai_analysis') return <Brain size={20} />
    if (type === 'medical_record') return <FileText size={20} />
    return <Activity size={20} />
  }

  const getEventColor = (type, riskLevel) => {
    if (type === 'ai_analysis') {
      if (riskLevel === 'HIGH') return '#ef4444'
      if (riskLevel === 'MODERATE') return '#f59e0b'
      return '#10b981'
    }
    return '#3b82f6'
  }

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#ef4444'
    if (risk === 'MODERATE') return '#f59e0b'
    if (risk === 'LOW') return '#10b981'
    return '#6b7280'
  }

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe']

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Generating your health story...
        </p>
      </div>
    )
  }

  if (error || !healthStory) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Link
          to={`/patients/${patientId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          Back to Patient
        </Link>
        <div className="card" style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)'
        }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#ef4444', fontSize: '1.125rem', fontWeight: '600' }}>
            {error || 'Health story not found'}
          </p>
        </div>
      </div>
    )
  }

  const calculateAge = () => {
    if (!patient?.dateOfBirth) return null
    const birthDate = new Date(patient.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }

  const age = calculateAge()

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Back Button */}
      <Link
        to={`/patients/${patientId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} />
        Back to Patient
      </Link>

      {/* Hero Header */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <BookOpen size={40} color="white" />
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.5rem'
          }}>
            Health Story
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.95,
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <User size={18} />
            {patient?.firstName} {patient?.lastName}
            {age && <span>• Age {age}</span>}
            {patient?.dateOfBirth && (
              <>
                <span>•</span>
                <Calendar size={16} />
                Born {formatDateShort(patient.dateOfBirth)}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '14px',
            marginBottom: '1rem'
          }}>
            <Calendar size={28} color="white" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.25rem' }}>
            {healthStory.summary?.totalEvents || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Total Events
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '14px',
            marginBottom: '1rem'
          }}>
            <FileText size={28} color="white" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981', marginBottom: '0.25rem' }}>
            {healthStory.summary?.medicalRecords || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Medical Records
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '14px',
            marginBottom: '1rem'
          }}>
            <Brain size={28} color="white" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8b5cf6', marginBottom: '0.25rem' }}>
            {healthStory.summary?.aiAnalyses || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            AI Analyses
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '14px',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={28} color="white" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', marginBottom: '0.25rem' }}>
            {riskDistribution.filter(r => r.name === 'HIGH').reduce((sum, r) => sum + r.value, 0)}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            High Risk Events
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: 'var(--bg-card)',
        padding: '0.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'chart', label: 'Analytics', icon: BarChart3 },
          { id: 'narrative', label: 'Narrative', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              background: viewMode === tab.id
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'transparent',
              color: viewMode === tab.id ? 'white' : 'var(--text-secondary)'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <>
          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }}
              />
              <input
                type="text"
                placeholder="Search events, diagnoses, symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'medical', 'ai'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '0.875rem 1.25rem',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    background: filterType === type
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'var(--bg-card)',
                    color: filterType === type ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${filterType === type ? 'transparent' : 'var(--border-subtle)'}`
                  }}
                >
                  {type === 'all' ? 'All Events' : type === 'medical' ? 'Medical Records' : 'AI Analyses'}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card" style={{
            padding: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                <Clock size={24} color="#667eea" />
                Health Timeline
              </h2>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                {filteredTimeline.length} {filteredTimeline.length === 1 ? 'event' : 'events'}
              </div>
            </div>

            {filteredTimeline.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
              }}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>No events found</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: 'linear-gradient(to bottom, #667eea, #764ba2)',
                  borderRadius: '2px'
                }} />

                {filteredTimeline.map((event, index) => {
                  const riskLevel = event.riskLevel || 'UNKNOWN'
                  const eventColor = getEventColor(event.type, riskLevel)
                  const isSelected = selectedEvent === index

                  return (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        marginBottom: '2rem',
                        animation: 'fadeInUp 0.5s ease forwards',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-1.75rem',
                        top: '0.75rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: eventColor,
                        border: '4px solid var(--bg-primary)',
                        boxShadow: `0 0 0 3px ${eventColor}40, 0 4px 12px rgba(0,0,0,0.15)`,
                        cursor: 'pointer',
                        zIndex: 2,
                        transition: 'transform 0.2s',
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />

                      {/* Event card */}
                      <div
                        className="card"
                        style={{
                          padding: '1.5rem',
                          borderLeft: `4px solid ${eventColor}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))'
                            : 'var(--bg-card)',
                          border: `1px solid ${isSelected ? eventColor + '40' : 'var(--border-subtle)'}`,
                          borderRadius: '12px',
                          boxShadow: isSelected
                            ? `0 8px 24px ${eventColor}20`
                            : '0 2px 8px rgba(0,0,0,0.05)',
                          transform: isSelected ? 'translateX(4px)' : 'translateX(0)'
                        }}
                        onClick={() => setSelectedEvent(isSelected ? null : index)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: `${eventColor}15`,
                            borderRadius: '12px',
                            flexShrink: 0
                          }}>
                            {getEventIcon(event.type)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              marginBottom: '0.5rem',
                              gap: '1rem',
                              flexWrap: 'wrap'
                            }}>
                              <h3 style={{
                                margin: 0,
                                fontSize: '1.125rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)'
                              }}>
                                {event.title}
                              </h3>
                              {riskLevel !== 'UNKNOWN' && (
                                <span style={{
                                  padding: '0.375rem 0.875rem',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  background: `${eventColor}20`,
                                  color: eventColor,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {riskLevel} RISK
                                </span>
                              )}
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              marginBottom: '0.75rem',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Calendar size={14} />
                                {formatDate(event.date)}
                              </div>
                              {event.recordType && (
                                <>
                                  <span>•</span>
                                  <span style={{
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--bg)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem'
                                  }}>
                                    {event.recordType}
                                  </span>
                                </>
                              )}
                              {event.confidenceScore && (
                                <>
                                  <span>•</span>
                                  <span style={{ fontWeight: '600', color: eventColor }}>
                                    {event.confidenceScore} confidence
                                  </span>
                                </>
                              )}
                            </div>

                            {isSelected && (
                              <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: `1px solid ${eventColor}30`,
                                animation: 'fadeIn 0.3s ease'
                              }}>
                                {event.description && (
                                  <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                      fontWeight: '700',
                                      marginBottom: '0.5rem',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <FileText size={16} />
                                      Description
                                    </div>
                                    <p style={{
                                      margin: 0,
                                      color: 'var(--text-secondary)',
                                      lineHeight: '1.6'
                                    }}>
                                      {event.description}
                                    </p>
                                  </div>
                                )}
                                {event.diagnosis && (
                                  <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                      fontWeight: '700',
                                      marginBottom: '0.5rem',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <Stethoscope size={16} />
                                      Diagnosis
                                    </div>
                                    <p style={{
                                      margin: 0,
                                      color: 'var(--text-secondary)',
                                      lineHeight: '1.6'
                                    }}>
                                      {event.diagnosis}
                                    </p>
                                  </div>
                                )}
                                {event.symptoms && (
                                  <div>
                                    <div style={{
                                      fontWeight: '700',
                                      marginBottom: '0.5rem',
                                      color: 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <Activity size={16} />
                                      Symptoms
                                    </div>
                                    <p style={{
                                      margin: 0,
                                      color: 'var(--text-secondary)',
                                      lineHeight: '1.6'
                                    }}>
                                      {event.symptoms}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Event Trends */}
          <div className="card" style={{
            padding: '2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px'
          }}>
            <h2 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              <TrendingUp size={24} color="#667eea" />
              Event Trends Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMedical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-')
                    return `${month}/${year.slice(2)}`
                  }}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: 'white'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="medical"
                  stackId="1"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorMedical)"
                  name="Medical Records"
                />
                <Area
                  type="monotone"
                  dataKey="ai"
                  stackId="1"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorAI)"
                  name="AI Analyses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          {riskDistribution.length > 0 && (
            <div className="card" style={{
              padding: '2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px'
            }}>
              <h2 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                <PieChartIcon size={24} color="#667eea" />
                Risk Level Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: 'white'
                    }}
                  />
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Narrative View */}
      {viewMode === 'narrative' && healthStory.narrative && (
        <div className="card" style={{
          marginBottom: '2rem',
          padding: '2.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px'
            }}>
              <BookOpen size={24} color="white" />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Health Narrative
            </h2>
          </div>
          <div style={{
            lineHeight: '1.8',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            fontSize: '1.0625rem',
            background: 'var(--bg)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            {healthStory.narrative}
          </div>
        </div>
      )}

      {/* Ask AI - RAG Q&A Section */}
      <div className="card" style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        padding: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            borderRadius: '12px'
          }}>
            <MessageCircle size={24} color="white" />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Ask AI About This Patient
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              Ask questions about the patient's health history, records, and AI analyses
            </p>
          </div>
        </div>

        {/* Question Input Form */}
        <form onSubmit={handleAskQuestion} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'stretch'
          }}>
            <input
              type="text"
              value={qaQuestion}
              onChange={(e) => setQaQuestion(e.target.value)}
              placeholder="e.g., What are the patient's main health concerns? Any allergies I should know about?"
              disabled={qaLoading}
              style={{
                flex: 1,
                padding: '1rem 1.25rem',
                background: 'var(--bg)',
                border: '2px solid var(--border-subtle)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#06b6d4'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              type="submit"
              disabled={qaLoading || !qaQuestion.trim()}
              style={{
                padding: '1rem 1.5rem',
                background: qaLoading || !qaQuestion.trim()
                  ? 'var(--text-secondary)'
                  : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9375rem',
                cursor: qaLoading || !qaQuestion.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!qaLoading && qaQuestion.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {qaLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Thinking...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Ask
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {qaLoading && (
          <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(8, 145, 178, 0.05))',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#0891b2'
            }}>
              <Brain size={24} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontWeight: '600' }}>Analyzing patient data and generating response...</span>
            </div>
          </div>
        )}

        {/* Answer Display */}
        {qaAnswer && !qaLoading && (
          <div style={{
            padding: '1.5rem',
            background: qaAnswer.success
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))',
            borderRadius: '12px',
            border: `1px solid ${qaAnswer.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            marginBottom: qaHistory.length > 0 ? '1.5rem' : 0
          }}>
            {qaAnswer.success ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: '#059669'
                }}>
                  <Brain size={20} />
                  <span style={{ fontWeight: '700' }}>AI Response</span>
                  {qaAnswer.responseTimeMs && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginLeft: 'auto'
                    }}>
                      {qaAnswer.responseTimeMs}ms • {qaAnswer.sourcesUsed?.medicalRecords || 0} records • {qaAnswer.sourcesUsed?.aiAnalyses || 0} analyses
                    </span>
                  )}
                </div>
                <div style={{
                  lineHeight: '1.7',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9375rem'
                }}>
                  {(() => {
                    // Helper to render sections
                    const renderSection = (title, content) => (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#059669', marginBottom: '0.5rem', fontWeight: '600' }}>{title}</h4>
                        <div style={{ color: 'var(--text-primary)' }}>{content}</div>
                      </div>
                    );

                    try {
                      // Attempt to parse JSON response if it looks like JSON
                      let parsed = null;
                      const text = qaAnswer.answer.trim();
                      if (text.startsWith('{') && text.endsWith('}')) {
                        parsed = JSON.parse(text);
                      }

                      if (parsed) {
                        return (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            {parsed.primaryClinicalSummary && renderSection('Clinical Summary', parsed.primaryClinicalSummary)}
                            {parsed.primaryClinicalImpression && renderSection('Clinical Impression', parsed.primaryClinicalImpression)}

                            {parsed.riskAssessment && (
                              <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                                <h4 style={{ color: '#be123c', margin: '0 0 0.5rem 0' }}>Risk Assessment: {parsed.riskAssessment.overallRiskLevel}</h4>
                                <p style={{ margin: 0 }}>{parsed.riskAssessment.riskFactors}</p>
                              </div>
                            )}

                            {parsed.recommendations && (
                              <div>
                                <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>Recommendations</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                  {parsed.recommendations.immediateActions?.map((action, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{action}</li>
                                  ))}
                                  {parsed.recommendations.furtherDiagnosticEvaluation?.map((action, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem' }}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {parsed.diseaseStage && (
                              <div
                                style={{
                                  background: '#eff6ff',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  border: '1px solid #dbeafe',
                                  color: '#000' // 👈 force black text
                                }}
                              >
                                <h4
                                  style={{
                                    margin: '0 0 0.5rem 0',
                                    color: '#000' // 👈 ensure heading is black
                                  }}
                                >
                                  Disease Stage: {parsed.diseaseStage.stage}
                                </h4>

                                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                  {parsed.diseaseStage.explanation?.map((point, i) => (
                                    <li key={i} style={{ marginBottom: '0.25rem', color: '#000' }}>
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}


                            {parsed.finalAINote && (
                              <p style={{
                                marginTop: '1rem',
                                fontStyle: 'italic',
                                color: 'var(--text-secondary)',
                                borderTop: '1px solid var(--border-subtle)',
                                paddingTop: '1rem'
                              }}>
                                🤖 Note: {parsed.finalAINote}
                              </p>
                            )}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fallback to plain text rendering if not JSON
                    }

                    // Fallback: Parse paragraphs and clean simple JSON wrapper if present
                    return qaAnswer.answer.split('\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                          {paragraph.replace(/^{\s*"answer":\s*"/, '').replace(/"\s*}$/, '').replace(/\\n/g, '\n')}
                        </p>
                      )
                    ));
                  })()}
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#dc2626'
              }}>
                <AlertTriangle size={20} />
                <span>{qaAnswer.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Previous Questions */}
        {qaHistory.length > 0 && !qaLoading && (
          <div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={14} />
              Previous Questions ({qaHistory.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {qaHistory.slice(-3).reverse().map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setQaQuestion(item.question)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg)'}
                >
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Q: </span>
                  {item.question}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Events */}
      {healthStory.keyEvents && healthStory.keyEvents.length > 0 && (
        <div className="card" style={{
          marginTop: '2rem',
          padding: '2rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            <Sparkles size={24} color="#667eea" />
            Key Events
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {healthStory.keyEvents.map((event, index) => (
              <div
                key={index}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #667eea',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.0625rem'
                }}>
                  {event.title}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={14} />
                  {formatDate(event.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default HealthStory
