import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Calendar, 
  Pill, 
  Brain,
  ArrowRight,
  TrendingUp,
  Activity,
  Mic,
  Globe,
  Sparkles,
  Zap,
  Heart,
  Shield,
  Clock,
  BarChart3,
  Cpu,
  Waves,
  Target,
  Star
} from 'lucide-react'
import { patientsAPI, medicalRecordsAPI, appointmentsAPI, prescriptionsAPI, aiAnalysisAPI } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    medicalRecords: 0,
    appointments: 0,
    prescriptions: 0,
    aiAnalyses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, recordsRes, appointmentsRes, prescriptionsRes, analysesRes] = await Promise.all([
          patientsAPI.getAll(),
          medicalRecordsAPI.getAll(),
          appointmentsAPI.getAll(),
          prescriptionsAPI.getAll(),
          aiAnalysisAPI.getAll(),
        ])
        setStats({
          patients: patientsRes.data.length,
          medicalRecords: recordsRes.data.length,
          appointments: appointmentsRes.data.length,
          prescriptions: prescriptionsRes.data.length,
          aiAnalyses: analysesRes.data.length,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({
          patients: 0,
          medicalRecords: 0,
          appointments: 0,
          prescriptions: 0,
          aiAnalyses: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { 
      title: 'Total Patients', 
      value: stats.patients, 
      icon: Users, 
      gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
      glow: 'rgba(124, 58, 237, 0.3)',
      link: '/patients',
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Medical Records', 
      value: stats.medicalRecords, 
      icon: FileText, 
      gradient: 'linear-gradient(135deg, #00ff88, #00d4ff)',
      glow: 'rgba(0, 255, 136, 0.3)',
      link: '/medical-records',
      change: '+8%',
      trend: 'up'
    },
    { 
      title: 'Appointments', 
      value: stats.appointments, 
      icon: Calendar, 
      gradient: 'linear-gradient(135deg, #ffd700, #ff6b6b)',
      glow: 'rgba(255, 215, 0, 0.3)',
      link: '/appointments',
      change: '+24%',
      trend: 'up'
    },
    { 
      title: 'Prescriptions', 
      value: stats.prescriptions, 
      icon: Pill, 
      gradient: 'linear-gradient(135deg, #ff6b6b, #ff8a8a)',
      glow: 'rgba(255, 107, 107, 0.3)',
      link: '/prescriptions',
      change: '+5%',
      trend: 'up'
    },
    { 
      title: 'AI Analyses', 
      value: stats.aiAnalyses, 
      icon: Brain, 
      gradient: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
      glow: 'rgba(0, 212, 255, 0.3)',
      link: '/ai-analysis',
      change: '+32%',
      trend: 'up'
    },
  ]

  const quickActions = [
    { label: 'Add Patient', icon: Users, path: '/patients/new', color: '#7c3aed' },
    { label: 'Schedule', icon: Calendar, path: '/appointments/new', color: '#ffd700' },
    { label: 'AI Analysis', icon: Brain, path: '/ai-analysis/new', color: '#00d4ff' },
    { label: 'Prescription', icon: Pill, path: '/prescriptions/new', color: '#ff6b6b' },
  ]

  const features = [
    {
      title: 'Predictive Health Timeline',
      description: '3D visualization of health trajectories with Framingham risk calculations',
      icon: TrendingUp,
      path: '/patients',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      badge: 'New',
      highlight: true,
    },
    {
      title: 'Voice Consultation',
      description: 'Talk to our AI assistant for instant medical insights',
      icon: Mic,
      path: '/voice-consultation',
      gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
      badge: 'AI',
    },
    {
      title: 'Population Intelligence',
      description: 'Analyze health trends across your entire patient base',
      icon: Globe,
      path: '/population-intelligence',
      gradient: 'linear-gradient(135deg, #00ff88, #00d4ff)',
      badge: 'AI',
    },
  ]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Initializing AI Systems...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.6s ease forwards',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '30%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>
            <div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'rgba(0, 212, 255, 0.15)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '100px',
                padding: '0.375rem 1rem',
                marginBottom: '1rem',
              }}>
                <Sparkles size={14} color="#00d4ff" />
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#00d4ff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  AI-Powered Healthcare
                </span>
              </div>
              
              <h1 style={{ 
                fontSize: 'clamp(2rem, 4vw, 3rem)', 
                fontWeight: '800',
                marginBottom: '0.75rem',
                lineHeight: '1.1',
              }}>
                Welcome to{' '}
                <span style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  InnovAItion
                </span>
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                maxWidth: '500px',
                lineHeight: '1.6',
              }}>
                Your intelligent healthcare companion. Harness the power of AI for better patient outcomes.
              </p>
            </div>

            <div style={{
              background: 'rgba(10, 10, 18, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              backdropFilter: 'blur(10px)',
              textAlign: 'right',
            }}>
              <p style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}>
                Current Time
              </p>
              <p style={{ 
                fontSize: '2rem', 
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-primary)',
                letterSpacing: '0.02em',
              }}>
                {time.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
              }}>
                {time.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <Zap size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Quick Actions</h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 0.5s ease forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.boxShadow = `0 0 30px ${action.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${action.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={22} color={action.color} />
                </div>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <BarChart3 size={20} color="var(--accent-tertiary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Overview</h2>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.25rem',
        }}>
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                to={card.link}
                style={{ 
                  textDecoration: 'none',
                  animation: 'fadeInUp 0.5s ease forwards',
                  animationDelay: `${(index + 4) * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 0 40px ${card.glow}`
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                }}
                >
                  {/* Gradient accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: card.gradient,
                  }} />
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: card.gradient,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 20px ${card.glow}`,
                    }}>
                      <Icon size={24} color="white" />
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '100px',
                      padding: '0.25rem 0.625rem',
                    }}>
                      <TrendingUp size={12} color="#00ff88" />
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '600',
                        color: '#00ff88'
                      }}>
                        {card.change}
                      </span>
                    </div>
                  </div>

                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-muted)',
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {card.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h3 style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: '800',
                      background: card.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: '1',
                    }}>
                      {card.value}
                    </h3>
                  </div>

                  <div style={{ 
                    marginTop: '1rem',
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.375rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                  }}>
                    <span>View details</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Advanced Features */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <Cpu size={20} color="var(--accent-secondary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Advanced AI Features</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Link 
                key={feature.title}
                to={feature.path}
                style={{
                  background: feature.gradient,
                  borderRadius: '20px',
                  padding: '2rem',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  animation: 'fadeInUp 0.5s ease forwards',
                  animationDelay: `${(index + 9) * 0.1}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Pattern overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%)',
                  transform: 'translate(30%, -30%)',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={28} color="white" />
                    </div>
                    <span style={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '100px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {feature.badge}
                    </span>
                  </div>

                  <h3 style={{ 
                    fontSize: '1.375rem', 
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                  }}>
                    <span>Explore</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '1.5rem',
        animation: 'fadeInUp 0.5s ease forwards',
        animationDelay: '1.1s',
        opacity: 0,
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <Activity size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>System Status</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { label: 'AI Engine', status: 'Operational', color: '#00ff88' },
            { label: 'Database', status: 'Connected', color: '#00ff88' },
            { label: 'API Services', status: 'Running', color: '#00ff88' },
            { label: 'ML Models', status: 'Loaded', color: '#00d4ff' },
          ].map((item, index) => (
            <div 
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
              }}
            >
              <span style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)' 
              }}>
                {item.label}
              </span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}`,
                }} />
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '600',
                  color: item.color 
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
