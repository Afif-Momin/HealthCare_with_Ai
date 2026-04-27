import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Users, FileText, Calendar, Pill, Brain,
  Menu, X, ChevronLeft, ChevronRight, Bell, Sparkles,
  Activity, Mic, Globe, Zap, Heart, Scan, LogOut, User,
  Shield, Stethoscope, UserCheck, HeartPulse, ChevronDown
} from 'lucide-react'
import { useAuth, ROLE_SIDEBAR } from '../context/AuthContext'

const ROLE_META = {
  ADMIN: { label: 'Administrator', color: '#ffd700', icon: Shield },
  DOCTOR: { label: 'Doctor', color: '#00d4ff', icon: Stethoscope },
  NURSE: { label: 'Nurse', color: '#ff6b6b', icon: Heart },
  PATIENT: { label: 'Patient', color: '#00ff88', icon: UserCheck },
}

const ICON_MAP = {
  '/': LayoutDashboard,
  '/patients': Users,
  '/medical-records': FileText,
  '/appointments': Calendar,
  '/prescriptions': Pill,
  '/ai-analysis': Brain,
  '/advanced-detection': Scan,
  '/voice-consultation': Mic,
  '/population-intelligence': Globe,
  '/medical-history': HeartPulse,
  '/profile': User,
}

const COLOR_MAP = {
  '/': '#00d4ff',
  '/patients': '#7c3aed',
  '/medical-records': '#00ff88',
  '/appointments': '#ffd700',
  '/prescriptions': '#ff6b6b',
  '/ai-analysis': '#00d4ff',
  '/advanced-detection': '#ff6b6b',
  '/voice-consultation': '#a78bfa',
  '/population-intelligence': '#00ff88',
  '/medical-history': '#00ff88',
  '/profile': '#a78bfa',
}

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const roleMeta = ROLE_META[user?.role] || ROLE_META.PATIENT
  const sidebarConfig = ROLE_SIDEBAR[user?.role] || ROLE_SIDEBAR.PATIENT
  const sidebarWidth = collapsed ? '80px' : '275px'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const handleLogout = () => { logout(); navigate('/login') }

  const buildItems = (list) => list.map(({ path, label }) => ({
    path, label, icon: ICON_MAP[path] || LayoutDashboard, color: COLOR_MAP[path] || '#00d4ff',
  }))

  const mainItems = buildItems(sidebarConfig.main)
  const advItems = buildItems(sidebarConfig.advanced || [])

  const NavItem = ({ path, label, icon: Icon, color, idx }) => {
    const active = isActive(path)
    const [hov, setHov] = useState(false)
    return (
      <Link to={path}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: collapsed ? '0.85rem' : '0.8rem 1rem',
          marginBottom: '0.3rem', borderRadius: '12px',
          textDecoration: 'none',
          background: active ? `${color}18` : hov ? `${color}0c` : 'transparent',
          border: active ? `1px solid ${color}38` : hov ? `1px solid ${color}18` : '1px solid transparent',
          color: active || hov ? 'white' : 'var(--text-secondary)',
          fontWeight: active ? '600' : '500',
          transition: 'all 0.18s ease',
          justifyContent: collapsed ? 'center' : 'flex-start',
          position: 'relative', overflow: 'hidden',
          animation: 'slideInLeft 0.35s ease both',
          animationDelay: `${idx * 0.04}s`,
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {active && <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: '3px', background: color, borderRadius: '0 3px 3px 0', boxShadow: `0 0 8px ${color}` }} />}
        <Icon size={19} style={{ color: active ? color : hov ? color : 'inherit', filter: active ? `drop-shadow(0 0 5px ${color})` : 'none', flexShrink: 0, transition: 'all 0.18s' }} />
        {!collapsed && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
      </Link>
    )
  }

  const DdItem = ({ icon: Icon, label, onClick, color = 'var(--text-secondary)', danger = false }) => {
    const [hov, setHov] = useState(false)
    const c = danger ? '#ff6b6b' : (hov ? color : 'var(--text-secondary)')
    return (
      <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.575rem 0.9rem', background: hov ? (danger ? 'rgba(255,107,107,0.1)' : `${color}10`) : 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: c, fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.15s', textAlign: 'left' }}>
        <Icon size={14} />
        {label}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 998 }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarWidth,
        background: 'rgba(10,10,18,0.97)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'fixed', height: '100vh', zIndex: 999,
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        backdropFilter: 'blur(24px)',
      }} className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(0,212,255,0.3)', flexShrink: 0 }}>
              <Sparkles size={20} color="white" />
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Healthcare with AI</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>AI-Powered Platform</div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.875rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {!collapsed && <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', padding: '0 0.5rem', marginBottom: '0.6rem', marginTop: 0 }}>Menu</p>}
          {mainItems.map((item, i) => <NavItem key={item.path} {...item} idx={i} />)}

          {advItems.length > 0 && <>
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }} />
            {!collapsed && <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', padding: '0 0.5rem', marginBottom: '0.6rem', marginTop: 0 }}>Advanced AI</p>}
            {advItems.map((item, i) => <NavItem key={item.path} {...item} idx={mainItems.length + i} />)}
          </>}

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }} />
          <NavItem path="/profile" label="My Profile" icon={User} color="#a78bfa" idx={mainItems.length + advItems.length} />
          {(user?.role === 'PATIENT' || user?.role === 'NURSE') && (
            <NavItem path="/medical-history" label="Medical History" icon={HeartPulse} color="#00ff88" idx={mainItems.length + advItems.length + 1} />
          )}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid var(--border-subtle)' }}>
          {!collapsed && (
            <div style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.09),rgba(124,58,237,0.09))', border: '1px solid rgba(0,212,255,0.18)', borderRadius: '12px', padding: '0.875rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                <Zap size={14} color="#00d4ff" /><span style={{ fontSize: '0.775rem', fontWeight: '600', color: 'white' }}>AI Status</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.7rem', color: '#00ff88' }}>All systems operational</span>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(p => !p)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.82rem', fontFamily: 'var(--font-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}>
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: sidebarWidth, flex: 1, transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          height: 'var(--nav-height)', position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(10,10,18,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
          transition: 'all 0.3s ease', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 1.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setMobileOpen(p => !p)}
              style={{ display: 'none', padding: '0.45rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '9px', color: 'var(--text-primary)', cursor: 'pointer' }}
              className="mobile-menu-btn">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Activity size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.03em' }}>
                {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]?.replace(/-/g, ' ')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* Notifications */}
            <button style={{ padding: '0.575rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '9px', color: 'var(--text-secondary)', cursor: 'pointer', position: 'relative', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.color = '#00d4ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <Bell size={17} />
              <span style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: '#ff6b6b', borderRadius: '50%', boxShadow: '0 0 7px #ff6b6b' }} />
            </button>

            {/* User menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button id="user-menu-btn" onClick={() => setUserMenuOpen(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.35rem 0.8rem 0.35rem 0.35rem', background: userMenuOpen ? `${roleMeta.color}14` : 'var(--bg-tertiary)', border: `1px solid ${userMenuOpen ? roleMeta.color + '38' : 'var(--border-subtle)'}`, borderRadius: '100px', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-primary)' }}>
                <div style={{ width: '30px', height: '30px', background: roleMeta.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '800', color: '#050508' }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.fullName?.split(' ')[0] || 'User'}</div>
                  <div style={{ fontSize: '0.62rem', color: roleMeta.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{roleMeta.label}</div>
                </div>
                <ChevronDown size={13} color="var(--text-muted)" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'rgba(12,12,20,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '0.45rem', minWidth: '210px', boxShadow: '0 20px 40px rgba(0,0,0,0.55)', backdropFilter: 'blur(24px)', animation: 'scaleIn 0.15s ease forwards', zIndex: 200 }}>
                  {/* User info */}
                  <div style={{ padding: '0.7rem 0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{user?.fullName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem', padding: '0.12rem 0.6rem', background: `${roleMeta.color}14`, border: `1px solid ${roleMeta.color}28`, borderRadius: '100px', fontSize: '0.62rem', fontWeight: '700', color: roleMeta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <roleMeta.icon size={9} /> {roleMeta.label}
                    </div>
                  </div>
                  <DdItem icon={User} label="My Profile" color="#a78bfa" onClick={() => { navigate('/profile'); setUserMenuOpen(false) }} />
                  {(user?.role === 'PATIENT' || user?.role === 'NURSE') && (
                    <DdItem icon={HeartPulse} label="Medical History" color="#00ff88" onClick={() => { navigate('/medical-history'); setUserMenuOpen(false) }} />
                  )}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.35rem 0' }} />
                  <DdItem icon={LogOut} label="Sign Out" danger onClick={() => { handleLogout(); setUserMenuOpen(false) }} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem' }}>{children}</main>

        {/* Footer */}
        <footer style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
            <Sparkles size={13} color="var(--accent-primary)" /> Powered by Healthcare with AI
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>© 2026 All rights reserved</p>
        </footer>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar { width: 275px !important; transform: translateX(-100%); }
          .sidebar.mobile-open { transform: translateX(0) !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

function DdItem({ icon: Icon, label, onClick, color = 'var(--text-secondary)', danger = false }) {
  const [hov, setHov] = useState(false)
  const c = danger ? '#ff6b6b' : (hov ? color : 'var(--text-secondary)')
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.575rem 0.9rem', background: hov ? (danger ? 'rgba(255,107,107,0.1)' : `${color}10`) : 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', color: c, fontFamily: 'var(--font-primary)', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.15s', textAlign: 'left' }}>
      <Icon size={14} />{label}
    </button>
  )
}

export default Layout
