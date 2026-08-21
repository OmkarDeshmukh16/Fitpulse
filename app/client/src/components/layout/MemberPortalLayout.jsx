import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import MemberSidebar from './MemberSidebar'
import MemberTopbar from './MemberTopbar'

export default function MemberPortalLayout() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const sidebarWidth = collapsed ? 72 : 250

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <MemberSidebar />
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MemberTopbar />
        <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
