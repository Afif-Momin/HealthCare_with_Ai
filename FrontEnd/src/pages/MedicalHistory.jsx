import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { medicalRecordsAPI, appointmentsAPI, prescriptionsAPI, aiAnalysisAPI } from '../services/api'
import { FileText, Calendar, Pill, Brain, Activity, Clock, ChevronDown, ChevronUp, AlertCircle, HeartPulse } from 'lucide-react'

const TABS = [
  { id: 'records', label: 'Medical Records', icon: FileText, color: '#00ff88' },
  { id: 'appointments', label: 'Appointments', icon: Calendar, color: '#ffd700' },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill, color: '#ff6b6b' },
  { id: 'ai', label: 'AI Analysis', icon: Brain, color: '#00d4ff' },
]

export default function MedicalHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('records')
  const [data, setData] = useState({ records: [], appointments: [], prescriptions: [], ai: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    const [r, a, p, ai] = await Promise.allSettled([
      medicalRecordsAPI.getAll(), appointmentsAPI.getAll(),
      prescriptionsAPI.getAll(), aiAnalysisAPI.getAll(),
    ])
    setData({
      records: r.status === 'fulfilled' ? (r.value.data || []) : [],
      appointments: a.status === 'fulfilled' ? (a.value.data || []) : [],
      prescriptions: p.status === 'fulfilled' ? (p.value.data || []) : [],
      ai: ai.status === 'fulfilled' ? (ai.value.data || []) : [],
    })
    setLoading(false)
  }

  const f = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  const counts = { records: data.records.length, appointments: data.appointments.length, prescriptions: data.prescriptions.length, ai: data.ai.length }
  const active = TABS.find(t => t.id === activeTab)

  const Card = ({ id, color, title, subtitle, date, badge, children }) => (
    <div style={{ background: expanded[id] ? `${color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${expanded[id] ? color + '28' : 'rgba(255,255,255,0.05)'}`, borderRadius: '12px', marginBottom: '0.625rem', overflow: 'hidden', transition: 'all 0.25s' }}>
      <div onClick={() => toggle(id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.95rem 1.2rem', cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{title}</span>
            {badge && <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.12rem 0.55rem', borderRadius: '100px', background: `${color}14`, color, border: `1px solid ${color}28`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{badge}</span>}
          </div>
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.15rem 0 0' }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {date && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} />{f(date)}</span>}
          {expanded[id] ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
        </div>
      </div>
      {expanded[id] && <div style={{ padding: '0 1.2rem 1.2rem', borderTop: `1px solid ${color}14`, paddingTop: '1rem' }}>{children}</div>}
    </div>
  )

  const Row = ({ label, value }) => value ? (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  ) : null

  const Empty = ({ label }) => (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      <Activity size={36} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
      <p style={{ margin: 0, fontSize: '0.875rem' }}>No {label} found.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', animation: 'fadeInUp 0.5s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg,#00ff88,#00d4ff)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={19} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>Medical History</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>Complete health timeline for {user?.fullName}</p>
      </div>

      {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}><AlertCircle size={15} color="#ff6b6b" /><p style={{ color: '#ff6b6b', margin: 0, fontSize: '0.875rem' }}>{error}</p></div>}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <div key={id} onClick={() => setActiveTab(id)} style={{ background: activeTab === id ? `${color}10` : 'rgba(15,15,26,0.8)', border: `1px solid ${activeTab === id ? color + '38' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '1.1rem', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(20px)', transform: activeTab === id ? 'translateY(-2px)' : 'none', boxShadow: activeTab === id ? `0 8px 20px ${color}18` : 'none' }}>
            <div style={{ width: '34px', height: '34px', background: `${color}14`, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.7rem' }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: activeTab === id ? color : 'var(--text-primary)', marginBottom: '0.2rem', lineHeight: 1 }}>{counts[id]}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
        <div style={{ padding: '1.1rem 1.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {active && <active.icon size={17} style={{ color: active.color }} />}
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>{active?.label}</h3>
          {loading && <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: active?.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginLeft: 'auto' }} />}
        </div>
        <div style={{ padding: '1rem' }}>
          {activeTab === 'records' && (data.records.length === 0 ? <Empty label="medical records" /> :
            data.records.map(r => <Card key={r.id} id={r.id} color="#00ff88" title={r.recordType || 'Medical Record'} subtitle={r.diagnosis} date={r.recordDate || r.createdAt} badge={r.recordType} expanded={expanded[r.id]} onToggle={() => toggle(r.id)}>
              <Row label="Chief Complaint" value={r.chiefComplaint} /><Row label="Treatment Plan" value={r.treatmentPlan} /><Row label="Notes" value={r.notes} />
            </Card>)
          )}
          {activeTab === 'appointments' && (data.appointments.length === 0 ? <Empty label="appointments" /> :
            data.appointments.map(a => <Card key={a.id} id={a.id} color="#ffd700" title={a.appointmentType || 'Appointment'} subtitle={a.doctorName || a.reason} date={a.appointmentDate} badge={a.status}>
              <Row label="Reason" value={a.reason} /><Row label="Notes" value={a.notes} />
            </Card>)
          )}
          {activeTab === 'prescriptions' && (data.prescriptions.length === 0 ? <Empty label="prescriptions" /> :
            data.prescriptions.map(p => <Card key={p.id} id={p.id} color="#ff6b6b" title={p.medicationName || 'Prescription'} subtitle={p.dosage} date={p.prescribedDate} badge={p.isActive ? 'Active' : 'Inactive'}>
              <Row label="Frequency" value={p.frequency} /><Row label="Duration" value={p.duration} /><Row label="Instructions" value={p.instructions} />
            </Card>)
          )}
          {activeTab === 'ai' && (data.ai.length === 0 ? <Empty label="AI analyses" /> :
            data.ai.map(a => <Card key={a.id} id={a.id} color="#00d4ff" title={a.analysisType || 'AI Analysis'} subtitle={a.confidenceScore ? `Confidence: ${a.confidenceScore}` : ''} date={a.createdAt} badge={a.analysisType}>
              <Row label="Result" value={a.analysisResult} /><Row label="Recommendations" value={a.recommendations} />
            </Card>)
          )}
        </div>
      </div>
    </div>
  )
}
