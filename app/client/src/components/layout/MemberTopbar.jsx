import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Bell, QrCode } from 'lucide-react'
import { selectCurrentUser, selectGymSettings } from '../../redux/slices/authSlice'

const routeLabels = {
  '/portal/dashboard': 'Dashboard',
  '/portal/profile': 'My Account & Pass',
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
  const navigate = useNavigate()
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

        {/* Quick Pass Icon Button */}
        <button
          className="btn btn-ghost"
          style={{ padding: '0.5rem', borderRadius: 8, color: '#10b981' }}
          onClick={() => navigate('/portal/profile')}
          title="Open My Account & Pass"
        >
          <QrCode size={18} />
        </button>

        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: 8, position: 'relative' }}>
          <Bell size={18} />
        </button>

        {/* Avatar / Account Trigger */}
        <div
          onClick={() => navigate('/portal/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.6rem 0.25rem 0.25rem',
            borderRadius: 24,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
          title="My Account Profile"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            fontSize: '0.85rem', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {user?.name?.split(' ')?.[0] || 'Member'}
          </span>
        </div>
      </div>
    </header>
  )
}
