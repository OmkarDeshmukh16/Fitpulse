import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store'

import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

import DashboardPage from './pages/dashboard/DashboardPage'
import MembersPage from './pages/members/MembersPage'
import AddMemberPage from './pages/members/AddMemberPage'
import PlansPage from './pages/plans/PlansPage'
import AttendancePage from './pages/attendance/AttendancePage'
import PaymentsPage from './pages/payments/PaymentsPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPage'

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
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/new" element={<AddMemberPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
