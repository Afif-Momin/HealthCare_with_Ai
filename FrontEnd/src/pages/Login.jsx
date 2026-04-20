import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Heart, Shield, Stethoscope, UserCheck, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
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

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(form)
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
        if (data.email && data.message?.includes('not verified')) {
          setNeedsVerification(true)
          setPendingEmail(data.email)
        }
        setError(data.message || 'Login failed.')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      if (err.response?.data?.email && msg?.includes('not verified')) {
        setNeedsVerification(true)
        setPendingEmail(err.response.data.email)
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const roleCards = [
    { role: 'Admin', icon: Shield, color: '#ffd700', desc: 'Full system access' },
    { role: 'Doctor', icon: Stethoscope, color: '#00d4ff', desc: 'Clinical management' },
    { role: 'Nurse', icon: Heart, color: '#ff6b6b', desc: 'Patient care' },
    { role: 'Patient', icon: UserCheck, color: '#00ff88', desc: 'Personal health' },
  ]

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
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', width: '100%', maxWidth: '1100px', gap: '3rem', alignItems: 'center', zIndex: 1 }}>

        {/* Left Panel */}
        <div style={{ flex: 1, display: 'none' }} className="login-left">
          <div style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'var(--gradient-primary)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,212,255,0.4)',
              }}>
                <Sparkles size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  InnovAItion
                </h2>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Healthcare AI</p>
              </div>
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              The Future of<br />
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Healthcare AI
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              A unified platform connecting patients, doctors, nurses, and administrators through the power of artificial intelligence.
            </p>

            {/* Role cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {roleCards.map(({ role, icon: Icon, color, desc }) => (
                <div key={role} style={{
                  background: `rgba(${color === '#00d4ff' ? '0,212,255' : color === '#7c3aed' ? '124,58,237' : color === '#ff6b6b' ? '255,107,107' : color === '#00ff88' ? '0,255,136' : '255,215,0'},0.07)`,
                  border: `1px solid ${color}25`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <div style={{ width: '36px', height: '36px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>{role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div style={{ flex: 1, maxWidth: '460px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(15,15,26,0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '2.5rem',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.5s ease forwards',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{
                width: '44px', height: '44px',
                background: 'var(--gradient-primary)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0,212,255,0.3)',
              }}>
                <Sparkles size={22} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  InnovAItion
                </h1>
                <p style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Healthcare AI</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Sign in to your account to continue</p>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}>
                <AlertCircle size={16} color="#ff6b6b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#ff6b6b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                  {needsVerification && (
                    <Link
                      to={`/signup?verify=true&email=${encodeURIComponent(pendingEmail)}`}
                      style={{ color: '#00d4ff', fontSize: '0.8rem', marginTop: '4px', display: 'inline-block' }}
                    >
                      → Verify your email now
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-primary)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.04)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '0.875rem 3rem 0.875rem 2.75rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-primary)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.5)'; e.target.style.background = 'rgba(0,212,255,0.04)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: loading ? 'rgba(0,212,255,0.3)' : 'var(--gradient-primary)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-primary)',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(0,212,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                Create account
              </Link>
            </p>

            {/* Admin hint */}
            <div style={{
              background: 'rgba(255,215,0,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: '10px',
              padding: '0.875rem 1rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              <Shield size={13} style={{ verticalAlign: 'middle', marginRight: '5px', color: '#ffd700' }} />
              Admin access: <span style={{ color: '#ffd700' }}>ismailmansury9737@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left { display: block !important; }
        }
      `}</style>
    </div>
  )
}
