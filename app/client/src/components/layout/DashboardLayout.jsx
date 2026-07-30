import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const sidebarWidth = collapsed ? 72 : 240

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
