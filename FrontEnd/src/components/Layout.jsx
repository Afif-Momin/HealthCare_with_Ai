import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Pill,
  Brain,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Settings,
  LogOut,
  Sparkles,
  Activity,
  Mic,
  Globe,
  Zap,
  Heart,
  Eye,
  Scan
} from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const mainMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#00d4ff' },
    { path: '/patients', icon: Users, label: 'Patients', color: '#7c3aed' },
    { path: '/medical-records', icon: FileText, label: 'Records', color: '#00ff88' },
    { path: '/appointments', icon: Calendar, label: 'Appointments', color: '#ffd700' },
    { path: '/prescriptions', icon: Pill, label: 'Prescriptions', color: '#ff6b6b' },
    { path: '/ai-analysis', icon: Brain, label: 'AI Analysis', color: '#00d4ff' },
  ]

  const advancedMenuItems = [
    { path: '/advanced-detection', icon: Scan, label: 'Visual & Audio AI', color: '#ff6b6b' },
    { path: '/voice-consultation', icon: Mic, label: 'Voice AI', color: '#a78bfa' },
    { path: '/population-intelligence', icon: Globe, label: 'Population', color: '#00ff88' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const sidebarWidth = sidebarCollapsed ? '80px' : '280px'

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        background: 'rgba(10, 10, 18, 0.95)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'fixed',
        height: '100vh',
        zIndex: 999,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)',
        transform: mobileMenuOpen ? 'translateX(0)' : undefined,
      }}
        className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: sidebarCollapsed ? '1.5rem 1rem' : '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            }}>
              <Sparkles size={22} color="white" />
            </div>
            {!sidebarCollapsed && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  InnovAItion
                </h1>
                <p style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  fontWeight: '500',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  Healthcare AI
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Main Navigation */}
        <nav style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {!sidebarCollapsed && (
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              padding: '0 0.75rem',
              marginBottom: '0.75rem',
            }}>
              Main Menu
            </p>
          )}

          {mainMenuItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: sidebarCollapsed ? '0.875rem' : '0.875rem 1rem',
                  marginBottom: '0.375rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: active ? 'white' : 'var(--text-secondary)',
                  background: active
                    ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                    : 'transparent',
                  border: active ? `1px solid ${item.color}40` : '1px solid transparent',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideInLeft 0.4s ease forwards`,
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = `${item.color}10`
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = `${item.color}20`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '60%',
                    background: item.color,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: `0 0 10px ${item.color}`,
                  }} />
                )}
                <Icon
                  size={20}
                  style={{
                    color: active ? item.color : 'inherit',
                    filter: active ? `drop-shadow(0 0 6px ${item.color})` : 'none',
                    flexShrink: 0,
                  }}
                />
                {!sidebarCollapsed && (
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                )}
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border-subtle)',
            margin: '1.25rem 0',
          }} />

          {!sidebarCollapsed && (
            <p style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600',
              padding: '0 0.75rem',
              marginBottom: '0.75rem',
            }}>
              Advanced AI
            </p>
          )}

          {advancedMenuItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: sidebarCollapsed ? '0.875rem' : '0.875rem 1rem',
                  marginBottom: '0.375rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: active ? 'white' : 'var(--text-secondary)',
                  background: active
                    ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                    : 'transparent',
                  border: active ? `1px solid ${item.color}40` : '1px solid transparent',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = `${item.color}10`
                    e.currentTarget.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '60%',
                    background: item.color,
                    borderRadius: '0 4px 4px 0',
                  }} />
                )}
                <Icon
                  size={20}
                  style={{
                    color: active ? item.color : 'inherit',
                    flexShrink: 0,
                  }}
                />
                {!sidebarCollapsed && (
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {!sidebarCollapsed && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1))',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap size={16} color="#00d4ff" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'white' }}>AI Status</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                All systems operational
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00ff88',
                  boxShadow: '0 0 10px #00ff88',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: '0.7rem', color: '#00ff88' }}>Connected</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.85rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)'
              e.currentTarget.style.borderColor = 'var(--border-light)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)'
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        marginLeft: sidebarWidth,
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Navbar */}
        <header style={{
          height: 'var(--nav-height)',
          background: scrolled ? 'rgba(10, 10, 18, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}>
          {/* Left - Mobile Menu & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '0.5rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--accent-primary)" />
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {location.pathname === '/' ? 'Dashboard' :
                  location.pathname.split('/')[1]?.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right - Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                padding: '0.625rem',
                background: searchOpen ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-tertiary)',
                border: searchOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: searchOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button
              style={{
                padding: '0.625rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.color = 'var(--accent-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)'
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: '#ff6b6b',
                borderRadius: '50%',
                boxShadow: '0 0 8px #ff6b6b',
              }} />
            </button>

            {/* User Avatar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.375rem 0.75rem 0.375rem 0.375rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--gradient-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Heart size={14} color="white" />
              </div>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
              }}>
                Dr. Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          animation: 'fadeInUp 0.5s ease forwards',
        }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            Powered by InnovAItion Healthcare AI
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2026 All rights reserved
          </p>
        </footer>
      </div>

      {/* Mobile Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            width: 280px !important;
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          main {
            margin-left: 0 !important;
          }
          header {
            margin-left: 0 !important;
          }
          footer {
            margin-left: 0 !important;
          }
        }
        
        @media (max-width: 1024px) {
          div[style*="marginLeft: ${sidebarWidth}"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Layout
