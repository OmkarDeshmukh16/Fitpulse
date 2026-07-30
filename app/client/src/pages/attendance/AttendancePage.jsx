import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, UserPlus, LogIn, LogOut, Camera, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useCheckInQRMutation,
} from '../../services/api'

function ManualCheckInModal({ onClose }) {
  const [memberId, setMemberId] = useState('')
  const [checkIn, { isLoading }] = useCheckInMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await checkIn({ memberId, method: 'manual' }).unwrap()
      toast.success(`✅ ${res.member.fullName} checked in!`)
      onClose()
    } catch (err) { toast.error(err?.data?.message || 'Check-in failed') }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal slide-up" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Manual Check-In</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter member's MongoDB ID or scan their QR.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Member ID</label>
            <input className="input" value={memberId} onChange={e => setMemberId(e.target.value)} placeholder="Member ObjectId..." required id="manual-checkin-id" autoFocus />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Checking in...' : 'Check In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AttendancePage() {
  const [showManual, setShowManual] = useState(false)
  const { data, isLoading, refetch } = useGetTodayAttendanceQuery()
  const [checkOut] = useCheckOutMutation()

  const records = data?.data || []
  const todayCount = data?.count || 0

  const handleCheckOut = async (memberId) => {
    try {
      await checkOut({ memberId }).unwrap()
      toast.success('Checked out')
      refetch()
    } catch (err) { toast.error(err?.data?.message || 'Check-out failed') }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{todayCount} check-ins today — {format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowManual(true)} id="manual-checkin-btn">
            <UserPlus size={16} /> Manual Check-In
          </button>
        </div>
      </div>

      {/* Today's live count */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: "Today's Check-ins", value: todayCount, color: '#6366f1' },
          { label: 'Currently In Gym', value: records.filter(r => !r.checkOutTime).length, color: '#10b981' },
          { label: 'Checked Out', value: records.filter(r => r.checkOutTime).length, color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{s.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Records Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Today's Log</h3>
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }} onClick={refetch}>Refresh</button>
        </div>
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No check-ins today yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Method</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {r.memberId?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{r.memberId?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.memberId?.memberId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${r.method === 'qr' ? 'badge-active' : 'badge-frozen'}`}>
                        {r.method === 'qr' ? <QrCode size={10} /> : null} {r.method}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.checkInTime ? format(new Date(r.checkInTime), 'HH:mm') : '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.checkOutTime ? format(new Date(r.checkOutTime), 'HH:mm') : <span style={{ color: 'var(--color-success)' }}>In Gym</span>}
                    </td>
                    <td>{r.duration ? `${r.duration} min` : '—'}</td>
                    <td>
                      {r.checkOutTime
                        ? <span className="badge badge-expired">Done</span>
                        : <span className="badge badge-active">Active</span>}
                    </td>
                    <td>
                      {!r.checkOutTime && (
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--color-warning)' }}
                          onClick={() => handleCheckOut(r.memberId?._id)}>
                          <LogOut size={13} /> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showManual && <ManualCheckInModal onClose={() => setShowManual(false)} />}
    </div>
  )
}
