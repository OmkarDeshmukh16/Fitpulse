import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Bell, Menu } from 'lucide-react'
import { selectCurrentUser, selectGymSettings } from '../../redux/slices/authSlice'
import { toggleMobileSidebar } from '../../redux/slices/uiSlice'

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/plans': 'Membership Plans',
  '/attendance': 'Attendance',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/superadmin': 'Super Admin',
}

export default function Topbar({ isMobile }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const gymSettings = useSelector(selectGymSettings)

  const pageTitle = Object.entries(routeLabels).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Fitpulse'

  return (
    <header style={{
      height: 64,
      padding: isMobile ? '0 1rem' : '0 2rem',
      borderBottom: '1px solid var(--color-bg-border)',
      background: 'var(--color-bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Mobile Hamburger Toggle */}
      {isMobile && (
        <button
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: 8, color: 'var(--color-text-primary)' }}
          onClick={() => dispatch(toggleMobileSidebar())}
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: isMobile ? '1rem' : '1.1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.75rem', flexShrink: 0 }}>
        {/* Currency / gym name */}
        {!isMobile && (
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {gymSettings?.currencySymbol || '₹'} {gymSettings?.gymName || 'Fitpulse'}
          </span>
        )}

        {/* Notification bell */}
        <button className="btn btn-ghost" style={{ padding: '0.45rem', borderRadius: 8, position: 'relative' }}>
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', cursor: 'default' }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
