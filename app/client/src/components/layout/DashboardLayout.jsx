import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { closeMobileSidebar } from '../../redux/slices/uiSlice'

export default function DashboardLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed)
  const mobileOpen = useSelector((s) => s.ui.mobileSidebarOpen)
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) dispatch(closeMobileSidebar())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch])

  // Close mobile sidebar on route change
  useEffect(() => {
    dispatch(closeMobileSidebar())
  }, [location.pathname, dispatch])

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 240)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)', position: 'relative' }}>
      <Sidebar isMobile={isMobile} />

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dispatch(closeMobileSidebar())}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <Topbar isMobile={isMobile} />
        <main
          style={{
            flex: 1,
            padding: isMobile ? '1rem' : '2rem',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
