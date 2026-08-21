import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useGetPortalAttendanceQuery } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function PortalAttendancePage() {
  const now = new Date()
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const { data, isLoading } = useGetPortalAttendanceQuery({ month, limit: 100 })

  const records = data?.data || []
  const summary = data?.summary || {}

  // Build calendar data
  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mon, 0).getDate()
  const firstDayOfWeek = new Date(year, mon - 1, 1).getDay() // 0=Sun
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Mon=0

  const attendedDates = new Set(records.map((r) => r.date))

  const prevMonth = () => {
    const d = new Date(year, mon - 2, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const d = new Date(year, mon, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = new Date(year, mon - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Days', value: summary.totalDays ?? 0, icon: CalendarCheck, color: '#10b981' },
          { label: 'This Month', value: summary.thisMonth ?? 0, icon: TrendingUp, color: '#6366f1' },
          { label: 'Avg Duration', value: records.length > 0 ? `${Math.round(records.filter(r => r.duration).reduce((s, r) => s + (r.duration || 0), 0) / Math.max(records.filter(r => r.duration).length, 1))} min` : '—', icon: Clock, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp} transition={{ delay: 0.05 * i }} className="stat-card">
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <s.icon size={16} color={s.color} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Calendar View */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={prevMonth} style={{ padding: '0.375rem' }}>
            <ChevronLeft size={18} />
          </button>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{monthLabel}</h3>
          <button className="btn btn-ghost" onClick={nextMonth} style={{ padding: '0.375rem' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '0.5rem 0' }}>{d}</div>
          ))}
          {/* Empty cells for first week offset */}
          {Array.from({ length: adjustedFirstDay }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const attended = attendedDates.has(dateStr)
            const isToday = dateStr === new Date().toISOString().split('T')[0]
            const isFuture = new Date(dateStr) > new Date()

            return (
              <div
                key={day}
                style={{
                  aspectRatio: '1', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: attended ? 700 : 400,
                  background: attended ? 'rgba(16,185,129,0.2)' : isFuture ? 'transparent' : 'var(--color-bg-secondary)',
                  color: attended ? '#10b981' : isFuture ? 'var(--color-bg-border)' : 'var(--color-text-muted)',
                  border: isToday ? '2px solid #10b981' : '1px solid var(--color-bg-border)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {day}
                {attended && (
                  <div style={{
                    position: 'absolute', bottom: 4, width: 4, height: 4,
                    borderRadius: '50%', background: '#10b981',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Table View */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Attendance Log</h3>
        {records.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No attendance records for this month.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.duration ? `${r.duration} min` : '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: 99,
                        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                        background: r.method === 'qr' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        color: r.method === 'qr' ? '#6366f1' : '#f59e0b',
                      }}>
                        {r.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
