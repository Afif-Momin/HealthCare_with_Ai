import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Shield, Stethoscope, Heart, UserCheck, Mail, Lock, AlertCircle } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const res = await authAPI.login(form)
      const data = res.data
      if (data.success) {
        login({ token: data.token, role: data.role, email: data.email, fullName: data.fullName, userId: data.userId })
        navigate('/')
      } else {
        if (data.email && data.message?.includes('not verified')) { setNeedsVerification(true); setPendingEmail(data.email) }
        setError(data.message || 'Login failed.')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      if (err.response?.data?.email && msg?.includes('not verified')) { setNeedsVerification(true); setPendingEmail(err.response.data.email) }
      setError(msg)
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
    color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'var(--font-primary)',
    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
  }
  const onFocus = e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.04)' }
  const onBlur = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  const roles = [
    { label: 'Admin', icon: Shield, color: '#ffd700', desc: 'Full system access' },
    { label: 'Doctor', icon: Stethoscope, color: '#00d4ff', desc: 'Clinical management' },
    { label: 'Nurse', icon: Heart, color: '#ff6b6b', desc: 'Patient care' },
    { label: 'Patient', icon: UserCheck, color: '#00ff88', desc: 'Personal health' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', width: '100%', maxWidth: '1100px', gap: '4rem', alignItems: 'center', zIndex: 1 }}>
        {/* Left — hero */}
        <div style={{ flex: 1 }} className="login-left">
          <div style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.4)' }}>
                <Sparkles size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InnovAItion</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Healthcare AI</div>
              </div>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              The Future of<br /><span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Healthcare AI</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              A unified platform connecting patients, doctors, nurses, and administrators through the power of AI.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {roles.map(({ label, icon: Icon, color, desc }) => (
                <div key={label} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>{label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div style={{ flex: 1, maxWidth: '460px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: 'rgba(15,15,26,0.88)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2.5rem', backdropFilter: 'blur(30px)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'fadeInUp 0.5s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--gradient-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
                <Sparkles size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InnovAItion</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Healthcare AI</div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Sign in to your account to continue</p>

            {error && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={16} color="#ff6b6b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: '#ff6b6b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                  {needsVerification && (
                    <Link to={`/signup?verify=true&email=${encodeURIComponent(pendingEmail)}`} style={{ color: '#00d4ff', fontSize: '0.8rem', marginTop: '4px', display: 'inline-block' }}>
                      → Verify your email now
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="login-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                    style={{ ...inp, paddingLeft: '2.5rem' }} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={handleChange} placeholder="Your password"
                    style={{ ...inp, paddingLeft: '2.5rem', paddingRight: '2.75rem' }} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                style={{ width: '100%', padding: '0.9rem', background: loading ? 'rgba(0,212,255,0.3)' : 'var(--gradient-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '0.95rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-primary)', boxShadow: loading ? 'none' : '0 0 20px rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }}>
                {loading ? (
                  <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Create account</Link>
            </p>

            <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Shield size={12} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#ffd700' }} />
              Admin: <span style={{ color: '#ffd700' }}>ismailmansury9737@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-left { display: none; }
        @media (min-width: 900px) { .login-left { display: block !important; } }
      `}</style>
    </div>
  )
}
