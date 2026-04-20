import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import {
  User, Mail, Phone, Shield, Stethoscope, Heart, UserCheck,
  Edit3, Save, X, Camera, Calendar, Droplets, MapPin,
  AlertCircle, Activity, ClipboardList, CheckCircle
} from 'lucide-react'

const ROLE_META = {
  ADMIN: { label: 'Administrator', color: '#ffd700', icon: Shield, gradient: 'linear-gradient(135deg, #ffd700, #ff6b6b)' },
  DOCTOR: { label: 'Doctor', color: '#00d4ff', icon: Stethoscope, gradient: 'linear-gradient(135deg, #00d4ff, #7c3aed)' },
  NURSE: { label: 'Nurse', color: '#ff6b6b', icon: Heart, gradient: 'linear-gradient(135deg, #ff6b6b, #ffd700)' },
  PATIENT: { label: 'Patient', color: '#00ff88', icon: UserCheck, gradient: 'linear-gradient(135deg, #00ff88, #00d4ff)' },
}

export default function Profile() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await authAPI.getProfile(user.email)
      setProfile(res.data)
      setForm(res.data)
    } catch (e) {
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await authAPI.updateProfile(user.email, form)
      // Update stored name if changed
      if (form.fullName && form.fullName !== user.fullName) {
        login({ ...user, fullName: form.fullName })
      }
      setProfile({ ...profile, ...form })
      setEditing(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) {
      setError('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
    setError('')
  }

  const roleMeta = ROLE_META[user?.role] || ROLE_META.PATIENT
  const RoleIcon = roleMeta.icon

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  }

  const readStyle = {
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
    padding: '0.75rem 0',
    minHeight: '2.5rem',
  }

  const fieldFocus = (e) => { e.target.style.borderColor = `${roleMeta.color}60`; e.target.style.background = `${roleMeta.color}08` }
  const fieldBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  const Field = ({ label, name, type = 'text', options, placeholder, icon: Icon, fullWidth = false }) => (
    <div style={{ gridColumn: fullWidth ? '1/-1' : 'auto' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
        {Icon && <Icon size={11} />} {label}
      </label>
      {editing ? (
        options ? (
          <select name={name} value={form[name] || ''} onChange={handleChange}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            onFocus={fieldFocus} onBlur={fieldBlur}>
            <option value="" style={{ background: '#0a0a12' }}>Select</option>
            {options.map(o => <option key={o} value={o} style={{ background: '#0a0a12' }}>{o}</option>)}
          </select>
        ) : (
          <input name={name} type={type} value={form[name] || ''} onChange={handleChange} placeholder={placeholder}
            style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
        )
      ) : (
        <div style={readStyle}>{profile?.[name] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Not set</span>}</div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeInUp 0.5s ease forwards' }}>

      {/* Success / Error */}
      {success && (
        <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <CheckCircle size={16} color="#00ff88" />
          <p style={{ color: '#00ff88', margin: 0, fontSize: '0.875rem' }}>{success}</p>
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AlertCircle size={16} color="#ff6b6b" />
          <p style={{ color: '#ff6b6b', margin: 0, fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Hero Banner */}
      <div style={{
        background: 'rgba(15,15,26,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: roleMeta.gradient }} />

        {/* Bg glow */}
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '300px', height: '300px', background: `radial-gradient(circle, ${roleMeta.color}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '90px', height: '90px',
              background: roleMeta.gradient,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', fontWeight: '800', color: 'white',
              boxShadow: `0 0 30px ${roleMeta.color}40`,
              flexShrink: 0,
            }}>
              {profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            {editing && (
              <button style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '28px', height: '28px',
                background: roleMeta.gradient, border: 'none',
                borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={12} color="white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                {profile?.fullName || user?.fullName}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.25rem 0.75rem',
                background: `${roleMeta.color}15`,
                border: `1px solid ${roleMeta.color}40`,
                borderRadius: '100px',
                fontSize: '0.75rem', fontWeight: '700',
                color: roleMeta.color, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <RoleIcon size={12} /> {roleMeta.label}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={13} /> {profile?.email || user?.email}
            </p>
            {profile?.phone && (
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} /> {profile.phone}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {editing ? (
              <>
                <button onClick={handleCancel}
                  style={{ padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <X size={15} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '0.625rem 1.25rem', background: roleMeta.gradient, border: 'none', borderRadius: '10px', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', boxShadow: `0 0 15px ${roleMeta.color}30` }}>
                  {saving ? <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button id="edit-profile-btn" onClick={() => setEditing(true)}
                style={{ padding: '0.625rem 1.25rem', background: `${roleMeta.color}15`, border: `1px solid ${roleMeta.color}40`, borderRadius: '10px', color: roleMeta.color, cursor: 'pointer', fontFamily: 'var(--font-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Basic Info */}
        <Section title="Personal Information" icon={User} color={roleMeta.color} span={2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Full Name" name="fullName" placeholder="Your full name" icon={User} />
            <Field label="Phone" name="phone" placeholder="+91 98765 43210" icon={Phone} />
          </div>
        </Section>

        {/* DOCTOR fields */}
        {user?.role === 'DOCTOR' && (
          <Section title="Professional Details" icon={Stethoscope} color={roleMeta.color} span={2}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Specialization" name="specialization" placeholder="Cardiology" />
              <Field label="License Number" name="licenseNumber" placeholder="MCI-12345" />
              <Field label="Department" name="department" placeholder="Cardiology Dept." />
            </div>
          </Section>
        )}

        {/* NURSE fields */}
        {user?.role === 'NURSE' && (
          <Section title="Professional Details" icon={Heart} color={roleMeta.color} span={2}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Department" name="department" placeholder="ICU" />
              <Field label="Ward" name="ward" placeholder="Ward 3B" />
              <Field label="Shift" name="shift" options={['Morning', 'Afternoon', 'Night']} />
            </div>
          </Section>
        )}

        {/* PATIENT fields */}
        {user?.role === 'PATIENT' && (<>
          <Section title="Health Information" icon={Activity} color={roleMeta.color} span={2}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <Field label="Date of Birth" name="dateOfBirth" type="date" icon={Calendar} />
              <Field label="Gender" name="gender" options={['Male', 'Female', 'Other']} />
              <Field label="Blood Group" name="bloodGroup" options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} icon={Droplets} />
              <Field label="Height (cm)" name="height" type="number" placeholder="170" />
              <Field label="Weight (kg)" name="weight" type="number" placeholder="70" />
            </div>
          </Section>
          <Section title="Medical Details" icon={ClipboardList} color={roleMeta.color} span={2}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Address" name="address" fullWidth placeholder="123 Main St, City" icon={MapPin} />
              <Field label="Known Allergies" name="allergies" placeholder="Penicillin, Peanuts..." />
              <Field label="Medical History Summary" name="medicalHistorySummary" placeholder="Hypertension, Diabetes..." />
              <Field label="Emergency Contact" name="emergencyContactName" placeholder="Contact name" />
              <Field label="Emergency Phone" name="emergencyContactPhone" placeholder="+91 ..." />
            </div>
          </Section>
        </>)}

        {/* ADMIN */}
        {user?.role === 'ADMIN' && (
          <Section title="Admin Access" icon={Shield} color="#ffd700" span={2}>
            <div style={{ padding: '1rem', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                You have <strong style={{ color: '#ffd700' }}>full system access</strong> as System Administrator. All routes, data, and settings are accessible.
              </p>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, color, children, span = 1 }) {
  return (
    <div style={{
      gridColumn: span === 2 ? '1/-1' : 'auto',
      background: 'rgba(15,15,26,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '1.75rem',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ width: '34px', height: '34px', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}
