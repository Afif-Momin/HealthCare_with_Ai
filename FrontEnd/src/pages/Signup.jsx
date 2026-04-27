import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Stethoscope, Heart, UserCheck, ChevronLeft, ChevronRight, Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { id: 'PATIENT', label: 'Patient', icon: UserCheck, color: '#00ff88', gradient: 'linear-gradient(135deg,#00ff88,#00d4ff)', desc: 'Personal health records, appointments and prescriptions.' },
  { id: 'DOCTOR', label: 'Doctor', icon: Stethoscope, color: '#00d4ff', gradient: 'linear-gradient(135deg,#00d4ff,#7c3aed)', desc: 'Manage patients, records, AI analysis, and clinical workflows.' },
  { id: 'NURSE', label: 'Nurse', icon: Heart, color: '#ff6b6b', gradient: 'linear-gradient(135deg,#ff6b6b,#ffd700)', desc: 'Support patient care, appointments and ward management.' },
]

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(0)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', specialization: '', licenseNumber: '', department: '', ward: '', shift: '', dateOfBirth: '', bloodGroup: '', address: '', gender: '', height: '', weight: '', allergies: '', medicalHistorySummary: '', emergencyContactName: '', emergencyContactPhone: '' })

  useEffect(() => {
    if (params.get('verify') === 'true' && params.get('email')) { setPendingEmail(params.get('email')); setStep(3) }
  }, [params])

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(p => p - 1), 1000); return () => clearTimeout(t) }
  }, [timer])

  const fc = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleOtpChange = (i, val) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').split('').slice(0, 6)
      const next = [...otp]; digits.forEach((d, j) => { if (i + j < 6) next[i + j] = d })
      setOtp(next); document.getElementById(`otp-${Math.min(i + digits.length, 5)}`)?.focus(); return
    }
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next); setError('')
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
  }

  const handleOtpKey = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus() }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password) { setError('Full name, email and password are required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form, role: selectedRole, height: form.height ? parseFloat(form.height) : undefined, weight: form.weight ? parseFloat(form.weight) : undefined }
      const res = await authAPI.register(payload)
      if (res.data.success) { setPendingEmail(form.email); setTimer(60); setStep(3); setSuccess(res.data.message) }
      else setError(res.data.message || 'Registration failed.')
    } catch (err) { setError(err.response?.data?.message || 'Registration failed. Try again.') }
    finally { setLoading(false) }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits.'); return }
    setLoading(true); setError('')
    try {
      const res = await authAPI.verifyOtp({ email: pendingEmail, otp: code })
      if (res.data.success) { login({ token: res.data.token, role: res.data.role, email: res.data.email, fullName: res.data.fullName, userId: res.data.userId }); navigate('/') }
      else setError(res.data.message || 'Invalid OTP.')
    } catch (err) { setError(err.response?.data?.message || 'OTP verification failed.') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    setLoading(true)
    try { await authAPI.resendOtp(pendingEmail); setTimer(60); setSuccess('New OTP sent!'); setOtp(['', '', '', '', '', '']) }
    catch { setError('Failed to resend OTP.') }
    finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '11px', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'var(--font-primary)', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s ease' }
  const lbl = { display: 'block', fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.35rem' }
  const ff = e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.04)' }
  const fb = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', animation: 'fadeInDown 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '38px', height: '38px', background: 'var(--gradient-primary)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Healthcare with AI</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Create your account' : step === 2 ? 'Personal information' : 'Verify your email'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {step === 1 ? 'Choose your role to get started' : step === 2 ? `Registering as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}` : `Code sent to ${pendingEmail}`}
          </p>
        </div>

        {/* Step dots */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s < step ? 'var(--gradient-primary)' : s === step ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', border: s === step ? '2px solid rgba(0,212,255,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', color: s <= step ? (s < step ? 'white' : '#00d4ff') : 'var(--text-muted)', transition: 'all 0.3s' }}>
                  {s < step ? <CheckCircle size={13} /> : s}
                </div>
                {s < 3 && <div style={{ width: '36px', height: '2px', background: s < step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)', transition: 'all 0.3s' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{ background: 'rgba(15,15,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '22px', padding: '2.25rem', backdropFilter: 'blur(30px)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'fadeInUp 0.5s ease forwards' }}>
          {error && (<div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.7rem' }}><AlertCircle size={15} color="#ff6b6b" style={{ flexShrink: 0, marginTop: '2px' }} /><p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{error}</p></div>)}
          {success && (<div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.7rem' }}><CheckCircle size={15} color="#00ff88" style={{ flexShrink: 0, marginTop: '2px' }} /><p style={{ color: '#00ff88', fontSize: '0.85rem', margin: 0 }}>{success}</p></div>)}

          {/* Step 1: Role */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {ROLES.map(({ id, label, icon: Icon, color, gradient, desc }) => (
                  <button key={id} id={`role-${id.toLowerCase()}`} onClick={() => { setSelectedRole(id); setError('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', background: selectedRole === id ? `${color}0f` : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedRole === id ? color + '45' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', cursor: 'pointer', textAlign: 'left', color: 'white', fontFamily: 'var(--font-primary)', transform: selectedRole === id ? 'scale(1.01)' : 'scale(1)', boxShadow: selectedRole === id ? `0 0 20px ${color}18` : 'none', transition: 'all 0.2s' }}>
                    <div style={{ width: '44px', height: '44px', background: selectedRole === id ? gradient : 'rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={21} color={selectedRole === id ? 'white' : color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.925rem', fontWeight: '700', marginBottom: '0.15rem' }}>{label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
                    </div>
                    {selectedRole === id && <CheckCircle size={18} style={{ color, flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
              <button id="role-next-btn" onClick={() => { if (!selectedRole) { setError('Please select a role.'); return } setError(''); setStep(2) }}
                style={{ width: '100%', padding: '0.875rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.93rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}>
                Continue <ChevronRight size={17} />
              </button>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Full Name *</label>
                  <div style={{ position: 'relative' }}><User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="fullName" value={form.fullName} onChange={fc} placeholder="Full name" style={{ ...inp, paddingLeft: '2.25rem' }} onFocus={ff} onBlur={fb} />
                  </div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Email Address *</label>
                  <div style={{ position: 'relative' }}><Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="email" type="email" value={form.email} onChange={fc} placeholder="you@example.com" style={{ ...inp, paddingLeft: '2.25rem' }} onFocus={ff} onBlur={fb} />
                  </div>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Password *</label>
                  <div style={{ position: 'relative' }}><Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={fc} placeholder="Min. 6 characters" style={{ ...inp, paddingLeft: '2.25rem', paddingRight: '2.5rem' }} onFocus={ff} onBlur={fb} />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div><label style={lbl}>Phone</label>
                  <div style={{ position: 'relative' }}><Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input name="phone" value={form.phone} onChange={fc} placeholder="+91 ..." style={{ ...inp, paddingLeft: '2.25rem' }} onFocus={ff} onBlur={fb} />
                  </div>
                </div>

                {/* Doctor */}
                {selectedRole === 'DOCTOR' && <>
                  <div><label style={lbl}>Specialization</label><input name="specialization" value={form.specialization} onChange={fc} placeholder="Cardiology" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>License No.</label><input name="licenseNumber" value={form.licenseNumber} onChange={fc} placeholder="MCI-12345" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Department</label><input name="department" value={form.department} onChange={fc} placeholder="Cardiology Dept." style={inp} onFocus={ff} onBlur={fb} /></div>
                </>}

                {/* Nurse */}
                {selectedRole === 'NURSE' && <>
                  <div><label style={lbl}>Department</label><input name="department" value={form.department} onChange={fc} placeholder="ICU" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Ward</label><input name="ward" value={form.ward} onChange={fc} placeholder="Ward 3B" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Shift</label>
                    <select name="shift" value={form.shift} onChange={fc} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={ff} onBlur={fb}>
                      <option value="" style={{ background: '#0a0a12' }}>Select Shift</option>
                      {['Morning', 'Afternoon', 'Night'].map(s => <option key={s} value={s} style={{ background: '#0a0a12' }}>{s}</option>)}
                    </select>
                  </div>
                </>}

                {/* Patient */}
                {selectedRole === 'PATIENT' && <>
                  <div><label style={lbl}>Date of Birth</label><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={fc} style={{ ...inp, colorScheme: 'dark' }} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Gender</label>
                    <select name="gender" value={form.gender} onChange={fc} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={ff} onBlur={fb}>
                      <option value="" style={{ background: '#0a0a12' }}>Select</option>
                      {['Male', 'Female', 'Other'].map(g => <option key={g} value={g} style={{ background: '#0a0a12' }}>{g}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={fc} style={{ ...inp, appearance: 'none', cursor: 'pointer' }} onFocus={ff} onBlur={fb}>
                      <option value="" style={{ background: '#0a0a12' }}>Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b} style={{ background: '#0a0a12' }}>{b}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Height (cm)</label><input name="height" type="number" value={form.height} onChange={fc} placeholder="170" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Weight (kg)</label><input name="weight" type="number" value={form.weight} onChange={fc} placeholder="70" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Address</label><input name="address" value={form.address} onChange={fc} placeholder="123 Main St, City" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Known Allergies</label><input name="allergies" value={form.allergies} onChange={fc} placeholder="Penicillin, Peanuts..." style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Emergency Contact</label><input name="emergencyContactName" value={form.emergencyContactName} onChange={fc} placeholder="Name" style={inp} onFocus={ff} onBlur={fb} /></div>
                  <div><label style={lbl}>Emergency Phone</label><input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={fc} placeholder="+91 ..." style={inp} onFocus={ff} onBlur={fb} /></div>
                </>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => { setStep(1); setError('') }}
                  style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                  <ChevronLeft size={15} /> Back
                </button>
                <button id="signup-submit" type="submit" disabled={loading}
                  style={{ flex: 1, padding: '0.875rem', background: loading ? 'rgba(0,212,255,0.25)' : 'var(--gradient-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.93rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {loading ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Creating...</> : <>Create Account <Mail size={15} /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: OTP */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '68px', height: '68px', background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
                <Mail size={30} color="#00d4ff" />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong style={{ color: 'white' }}>{pendingEmail}</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.55rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={6} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                    style={{ width: '50px', height: '58px', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800', background: d ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)', border: `2px solid ${d ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', color: d ? '#00d4ff' : 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-mono)', transition: 'all 0.2s', cursor: 'text' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.7)'; e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.2)' }}
                    onBlur={e => { e.target.style.borderColor = d ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                ))}
              </div>
              <button id="otp-verify-btn" onClick={handleVerify} disabled={loading || otp.join('').length < 6}
                style={{ width: '100%', padding: '0.875rem', background: otp.join('').length === 6 && !loading ? 'var(--gradient-primary)' : 'rgba(0,212,255,0.18)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.93rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', boxShadow: otp.join('').length === 6 ? '0 0 20px rgba(0,212,255,0.25)' : 'none', transition: 'all 0.2s' }}>
                {loading ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verifying...</> : <><CheckCircle size={15} /> Verify Email</>}
              </button>
              <button onClick={handleResend} disabled={timer > 0 || loading}
                style={{ background: 'none', border: 'none', cursor: timer > 0 ? 'not-allowed' : 'pointer', color: timer > 0 ? 'var(--text-muted)' : '#00d4ff', fontSize: '0.85rem', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', margin: '0 auto' }}>
                <RefreshCw size={13} /> {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
