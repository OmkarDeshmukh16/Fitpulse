import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, BarChart3,
  Settings, Dumbbell, ChevronLeft, ChevronRight, LogOut, Shield, X, Layers
} from 'lucide-react'
import { logout, selectGymSettings, selectCurrentUser } from '../../redux/slices/authSlice'
import { toggleSidebar, closeMobileSidebar } from '../../redux/slices/uiSlice'
import { useLogoutMutation } from '../../services/auth.api'

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/plans', icon: Dumbbell, label: 'Plans' },
  { to: '/templates', icon: Layers, label: 'Templates', roles: ['superadmin', 'gymowner', 'manager', 'trainer'] },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isMobile }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const mobileOpen = useSelector((s) => s.ui.mobileSidebarOpen)
  const gymSettings = useSelector(selectGymSettings)
  const user = useSelector(selectCurrentUser)
  const [logoutMutation] = useLogoutMutation()

  const handleLogout = async () => {
    try { await logoutMutation().unwrap() } catch {}
    dispatch(logout())
    if (isMobile) dispatch(closeMobileSidebar())
    navigate('/')
  }

  const rawNavItems = user?.role === 'superadmin'
    ? [{ to: '/superadmin', icon: Shield, label: 'Super Admin' }, ...baseNavItems]
    : baseNavItems

  const navItems = rawNavItems.filter((item) => !item.roles || item.roles.includes(user?.role))

  const handleNavClick = () => {
    if (isMobile) {
      dispatch(closeMobileSidebar())
    }
  }

  return (
    <motion.aside
      animate={
        isMobile
          ? { x: mobileOpen ? 0 : -320, width: 280 }
          : { x: 0, width: collapsed ? 72 : 240 }
      }
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-bg-border)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: isMobile ? 100 : 40,
        overflow: 'hidden',
        boxShadow: isMobile && mobileOpen ? '0 0 50px rgba(0,0,0,0.8)' : 'none',
      }}
    >
      {/* Logo Header */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Dumbbell size={18} color="#fff" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                {gymSettings?.gymName || 'Fitpulse'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {user?.role}
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile close button */}
        {isMobile && (
          <button
            className="btn btn-ghost"
            onClick={() => dispatch(closeMobileSidebar())}
            style={{ padding: '0.35rem', borderRadius: 8 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed && !isMobile ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && (
              <span style={{ whiteSpace: 'nowrap' }}>
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-bg-border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {(!collapsed || isMobile) && user && (
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
          </div>
        )}
        <button className="sidebar-link" onClick={handleLogout} title={collapsed && !isMobile ? 'Logout' : undefined}>
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
        {!isMobile && (
          <button
            className="sidebar-link"
            onClick={() => dispatch(toggleSidebar())}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </motion.aside>
  )
}
