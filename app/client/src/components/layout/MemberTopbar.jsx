import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Bell } from 'lucide-react'
import { selectCurrentUser, selectGymSettings } from '../../redux/slices/authSlice'

const routeLabels = {
  '/portal/dashboard': 'Dashboard',
  '/portal/membership': 'Membership',
  '/portal/attendance': 'My Attendance',
  '/portal/workout-plan': 'Workout Plan',
  '/portal/diet-plan': 'Diet Plan',
  '/portal/progress': 'Progress Tracker',
  '/portal/pt-sessions': 'PT Sessions',
  '/portal/payments': 'Payments & Receipts',
}

export default function MemberTopbar() {
  const location = useLocation()
  const user = useSelector(selectCurrentUser)
  const gymSettings = useSelector(selectGymSettings)

  const pageTitle = Object.entries(routeLabels).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'Member Portal'

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
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {gymSettings?.gymName || 'Fitpulse'}
        </span>

        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: 8, position: 'relative' }}>
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          fontSize: '0.875rem', flexShrink: 0, cursor: 'default',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))',
          color: '#10b981',
          border: '1px solid rgba(16,185,129,0.3)',
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'M'}
        </div>
      </div>
    </header>
  )
}
