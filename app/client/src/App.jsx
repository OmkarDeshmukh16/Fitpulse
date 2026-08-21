import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store'

import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import MemberPortalLayout from './components/layout/MemberPortalLayout'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

import DashboardPage from './pages/dashboard/DashboardPage'
import MembersPage from './pages/members/MembersPage'
import AddMemberPage from './pages/members/AddMemberPage'
import MemberDetailPage from './pages/members/MemberDetailPage'
import EditMemberPage from './pages/members/EditMemberPage'
import PlansPage from './pages/plans/PlansPage'
import AttendancePage from './pages/attendance/AttendancePage'
import PaymentsPage from './pages/payments/PaymentsPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPage'
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage'

// Member Portal Pages
import PortalDashboardPage from './pages/portal/PortalDashboardPage'
import PortalMembershipPage from './pages/portal/PortalMembershipPage'
import PortalAttendancePage from './pages/portal/PortalAttendancePage'
import PortalWorkoutPlanPage from './pages/portal/PortalWorkoutPlanPage'
import PortalDietPlanPage from './pages/portal/PortalDietPlanPage'
import PortalProgressPage from './pages/portal/PortalProgressPage'
import PortalPTSessionsPage from './pages/portal/PortalPTSessionsPage'
import PortalPaymentsPage from './pages/portal/PortalPaymentsPage'

// Lazy-load the landing page so Three.js/3D bundle doesn't affect dashboard load time
const LandingPage = lazy(() => import('./pages/landing/LandingPage'))

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12122a',
              color: '#f1f5f9',
              border: '1px solid #1e1e38',
              borderRadius: 10,
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#12122a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#12122a' } },
          }}
        />
        <Routes>
          {/* Landing page — loaded lazily so 3D assets don't bloat admin bundle */}
          <Route
            path="/"
            element={
              <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh' }} />}>
                <LandingPage />
              </Suspense>
            }
          />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected admin/staff routes */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin', 'gymowner', 'manager', 'trainer', 'receptionist']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/superadmin" element={<SuperAdminDashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/new" element={<AddMemberPage />} />
              <Route path="/members/:id" element={<MemberDetailPage />} />
              <Route path="/members/:id/edit" element={<EditMemberPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Protected member portal routes */}
          <Route element={<ProtectedRoute allowedRoles={['member']} />}>
            <Route element={<MemberPortalLayout />}>
              <Route path="/portal/dashboard" element={<PortalDashboardPage />} />
              <Route path="/portal/membership" element={<PortalMembershipPage />} />
              <Route path="/portal/attendance" element={<PortalAttendancePage />} />
              <Route path="/portal/workout-plan" element={<PortalWorkoutPlanPage />} />
              <Route path="/portal/diet-plan" element={<PortalDietPlanPage />} />
              <Route path="/portal/progress" element={<PortalProgressPage />} />
              <Route path="/portal/pt-sessions" element={<PortalPTSessionsPage />} />
              <Route path="/portal/payments" element={<PortalPaymentsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
