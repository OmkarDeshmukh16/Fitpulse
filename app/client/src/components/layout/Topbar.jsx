import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Bell, Search } from 'lucide-react'
import { selectCurrentUser, selectGymSettings } from '../../redux/slices/authSlice'

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/plans': 'Membership Plans',
  '/attendance': 'Attendance',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function Topbar() {
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const gymSettings = useSelector(selectGymSettings)

  const pageTitle = Object.entries(routeLabels).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Fitpulse'

  return (
    <header style={{
      height: 64,
      padding: '0 2rem',
      borderBottom: '1px solid var(--color-bg-border)',
      background: 'var(--color-bg-secondary)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Currency / gym name */}
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {gymSettings?.currencySymbol || '₹'} {gymSettings?.gymName || 'Fitpulse'}
        </span>

        {/* Notification bell */}
        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: 8, position: 'relative' }}>
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="avatar" style={{ cursor: 'default' }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  )
}
