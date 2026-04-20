import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles, Stethoscope, Heart, UserCheck, Shield,
  ChevronLeft, ChevronRight, Mail, Lock, User, Phone,
  Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  {
    id: 'PATIENT',
    label: 'Patient',
    icon: UserCheck,
    color: '#00ff88',
    gradient: 'linear-gradient(135deg, #00ff88, #00d4ff)',
    desc: 'Access your personal health records, appointments, and prescriptions.',
  },
  {
    id: 'DOCTOR',
    label: 'Doctor',
    icon: Stethoscope,
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
    desc: 'Manage patients, records, AI analysis, and clinical workflows.',
  },
  {
    id: 'NURSE',
    label: 'Nurse',
    icon: Heart,
    color: '#ff6b6b',
    gradient: 'linear-gradient(135deg, #ff6b6b, #ffd700)',
    desc: 'Support patient care, manage appointments, and monitor records.',
  },
]

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()

  const [step, setStep] = useState(1) // 1=role, 2=form, 3=otp
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(0)

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    // Doctor
    specialization: '', licenseNumber: '', department: '',
    // Nurse
    ward: '', shift: '',
    // Patient
    dateOfBirth: '', bloodGroup: '', address: '', gender: '',
    height: '', weight: '', allergies: '', medicalHistorySummary: '',
    emergencyContactName: '', emergencyContactPhone: '',
  })

  // Handle redirect from login for verification
  useEffect(() => {
    if (params.get('verify') === 'true' && params.get('email')) {
      setPendingEmail(params.get('email'))
      setStep(3)
    }
  }, [params])

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(p => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [otpTimer])

  const handleFormChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleStep1Next = () => {
    if (!selectedRole) { setError('Please select your role.'); return }
    setError('')
    setStep(2)
  }

  const handleStep2Submit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      setError('Full name, email and password are required.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        role: selectedRole,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      }
      const res = await authAPI.register(payload)
      const data = res.data
      if (data.success) {
        setPendingEmail(form.email)
        setOtpTimer(60)
        setStep(3)
        setSuccess(data.message)
      } else {
        setError(data.message || 'Registration failed.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, val) => {
    if (val.length > 1) {
      // Paste handling
      const digits = val.replace(/\D/g, '').split('').slice(0, 6)
      const newOtp = [...otp]
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d })
      setOtp(newOtp)
      const nextFocus = Math.min(index + digits.length, 5)
      document.getElementById(`otp-${nextFocus}`)?.focus()
      return
    }
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[index] = val
    setOtp(newOtp)
    setError('')
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.verifyOtp({ email: pendingEmail, otp: code })
      const data = res.data
      if (data.success) {
        login({
          token: data.token,
          role: data.role,
          email: data.email,
          fullName: data.fullName,
          userId: data.userId,
        })
        navigate('/')
      } else {
        setError(data.message || 'Invalid OTP.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await authAPI.resendOtp(pendingEmail)
      setOtpTimer(60)
      setSuccess('New OTP sent to ' + pendingEmail)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setError('Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
  }

  const fieldFocus = (e) => {
    e.target.style.borderColor = 'rgba(0,212,255,0.5)'
    e.target.style.background = 'rgba(0,212,255,0.04)'
  }
  const fieldBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.background = 'rgba(255,255,255,0.04)'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Bg orbs */}
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeInDown 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
              <Sparkles size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InnovAItion</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Create your account' : step === 2 ? 'Personal information' : 'Verify your email'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {step === 1 ? 'Choose your role to get started' : step === 2 ? `Registering as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}` : `Code sent to ${pendingEmail}`}
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: s <= step ? '28px' : '28px', height: '28px',
                  borderRadius: '50%',
                  background: s < step ? 'var(--gradient-primary)' : s === step ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: s === step ? '2px solid rgba(0,212,255,0.6)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700',
                  color: s <= step ? (s < step ? 'white' : '#00d4ff') : 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                }}>
                  {s < step ? <CheckCircle size={14} /> : s}
                </div>
                {s < 3 && <div style={{ width: '40px', height: '2px', background: s < step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)', transition: 'all 0.3s ease' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(15,15,26,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px',
          padding: '2.25rem',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          animation: 'fadeInUp 0.5s ease forwards',
        }}>

          {/* ERROR / SUCCESS */}
          {error && (
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <AlertCircle size={16} color="#ff6b6b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#ff6b6b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <CheckCircle size={16} color="#00ff88" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ color: '#00ff88', fontSize: '0.875rem', margin: 0 }}>{success}</p>
            </div>
          )}

          {/* ── STEP 1: Role selection ── */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.75rem' }}>
                {ROLES.map(({ id, label, icon: Icon, color, gradient, desc }) => (
                  <button
                    key={id}
                    id={`role-${id.toLowerCase()}`}
                    onClick={() => handleRoleSelect(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1.1rem 1.25rem',
                      background: selectedRole === id ? `rgba(${color === '#00ff88' ? '0,255,136' : color === '#00d4ff' ? '0,212,255' : '255,107,107'},0.1)` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedRole === id ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      color: 'white',
                      fontFamily: 'var(--font-primary)',
                      transform: selectedRole === id ? 'scale(1.01)' : 'scale(1)',
                      boxShadow: selectedRole === id ? `0 0 20px ${color}20` : 'none',
                    }}
                  >
                    <div style={{ width: '46px', height: '46px', background: selectedRole === id ? gradient : 'rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={22} color={selectedRole === id ? 'white' : color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.2rem', color: selectedRole === id ? 'white' : 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
                    </div>
                    {selectedRole === id && (
                      <CheckCircle size={20} style={{ color, flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
              <button
                id="role-next-btn"
                onClick={handleStep1Next}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: 'var(--gradient-primary)',
                  border: 'none', borderRadius: '12px',
                  color: 'white', fontSize: '0.95rem', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'var(--font-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                }}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Personal info ── */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Full Name */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="fullName" value={form.fullName} onChange={handleFormChange} placeholder="Dr. John Smith"
                      style={{ ...inputStyle, paddingLeft: '2.5rem' }} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                </div>
                {/* Email */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="you@example.com"
                      style={{ ...inputStyle, paddingLeft: '2.5rem' }} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                </div>
                {/* Password */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleFormChange} placeholder="Min. 6 characters"
                      style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.75rem' }} onFocus={fieldFocus} onBlur={fieldBlur} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 43210"
                      style={{ ...inputStyle, paddingLeft: '2.5rem' }} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                </div>

                {/* DOCTOR specific */}
                {selectedRole === 'DOCTOR' && <>
                  <div>
                    <label style={labelStyle}>Specialization</label>
                    <input name="specialization" value={form.specialization} onChange={handleFormChange} placeholder="Cardiology"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>License Number</label>
                    <input name="licenseNumber" value={form.licenseNumber} onChange={handleFormChange} placeholder="MCI-12345"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <input name="department" value={form.department} onChange={handleFormChange} placeholder="Cardiology Dept."
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                </>}

                {/* NURSE specific */}
                {selectedRole === 'NURSE' && <>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <input name="department" value={form.department} onChange={handleFormChange} placeholder="ICU"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Ward</label>
                    <input name="ward" value={form.ward} onChange={handleFormChange} placeholder="Ward 3B"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Shift</label>
                    <select name="shift" value={form.shift} onChange={handleFormChange}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={fieldFocus} onBlur={fieldBlur}>
                      <option value="" style={{ background: '#0a0a12' }}>Select Shift</option>
                      <option value="Morning" style={{ background: '#0a0a12' }}>Morning</option>
                      <option value="Afternoon" style={{ background: '#0a0a12' }}>Afternoon</option>
                      <option value="Night" style={{ background: '#0a0a12' }}>Night</option>
                    </select>
                  </div>
                </>}

                {/* PATIENT specific */}
                {selectedRole === 'PATIENT' && <>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleFormChange}
                      style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleFormChange}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={fieldFocus} onBlur={fieldBlur}>
                      <option value="" style={{ background: '#0a0a12' }}>Select Gender</option>
                      <option value="Male" style={{ background: '#0a0a12' }}>Male</option>
                      <option value="Female" style={{ background: '#0a0a12' }}>Female</option>
                      <option value="Other" style={{ background: '#0a0a12' }}>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleFormChange}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={fieldFocus} onBlur={fieldBlur}>
                      <option value="" style={{ background: '#0a0a12' }}>Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg =>
                        <option key={bg} value={bg} style={{ background: '#0a0a12' }}>{bg}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Height (cm)</label>
                    <input name="height" type="number" value={form.height} onChange={handleFormChange} placeholder="170"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Weight (kg)</label>
                    <input name="weight" type="number" value={form.weight} onChange={handleFormChange} placeholder="70"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Address</label>
                    <input name="address" value={form.address} onChange={handleFormChange} placeholder="123 Main St, City"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Known Allergies</label>
                    <input name="allergies" value={form.allergies} onChange={handleFormChange} placeholder="Penicillin, Peanuts..."
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency Contact</label>
                    <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleFormChange} placeholder="Name"
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                  <div>
                    <label style={labelStyle}>Emergency Phone</label>
                    <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleFormChange} placeholder="+91 ..."
                      style={inputStyle} onFocus={fieldFocus} onBlur={fieldBlur} />
                  </div>
                </>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  style={{
                    padding: '0.9rem 1.25rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-primary)',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button id="signup-submit" type="submit" disabled={loading}
                  style={{
                    flex: 1, padding: '0.9rem',
                    background: loading ? 'rgba(0,212,255,0.3)' : 'var(--gradient-primary)',
                    border: 'none', borderRadius: '12px',
                    color: 'white', fontSize: '0.95rem', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  {loading ? (
                    <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating account...</>
                  ) : <>Create Account <Mail size={16} /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: OTP ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px', height: '72px',
                background: 'rgba(0,212,255,0.1)',
                border: '2px solid rgba(0,212,255,0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 30px rgba(0,212,255,0.2)',
              }}>
                <Mail size={32} color="#00d4ff" />
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                We've sent a 6-digit OTP to <strong style={{ color: 'white' }}>{pendingEmail}</strong>.
                Enter it below to verify your account.
              </p>

              {/* OTP input boxes */}
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{
                      width: '52px', height: '60px',
                      textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: '700',
                      background: digit ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${digit ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '12px',
                      color: digit ? '#00d4ff' : 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'var(--font-mono)',
                      transition: 'all 0.2s ease',
                      cursor: 'text',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.7)'; e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.2)' }}
                    onBlur={e => { e.target.style.borderColor = digit ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                ))}
              </div>

              <button
                id="otp-verify-btn"
                onClick={handleVerifyOtp}
                disabled={loading || otp.join('').length < 6}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: otp.join('').length === 6 && !loading ? 'var(--gradient-primary)' : 'rgba(0,212,255,0.2)',
                  border: 'none', borderRadius: '12px',
                  color: 'white', fontSize: '0.95rem', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginBottom: '1rem',
                  boxShadow: otp.join('').length === 6 ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {loading ? (
                  <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verifying...</>
                ) : <>Verify Email <CheckCircle size={16} /></>}
              </button>

              <button
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || loading}
                style={{
                  background: 'none', border: 'none', cursor: otpTimer > 0 ? 'not-allowed' : 'pointer',
                  color: otpTimer > 0 ? 'var(--text-muted)' : '#00d4ff',
                  fontSize: '0.875rem', fontFamily: 'var(--font-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  margin: '0 auto',
                }}>
                <RefreshCw size={14} />
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
              </button>
            </div>
          )}
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
