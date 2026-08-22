import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Calendar, Clock, Plus, X, Loader, Dumbbell, Zap, StretchHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetPortalPTSessionsQuery, useBookPortalPTSessionMutation, useCancelPortalPTSessionMutation } from '../../services/portal.api'
import SearchableSelect from '../../components/common/SearchableSelect'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const sessionTypeConfig = {
  strength: { label: 'Strength', icon: Dumbbell, color: '#ef4444' },
  cardio: { label: 'Cardio', icon: Zap, color: '#f59e0b' },
  flexibility: { label: 'Flexibility', icon: StretchHorizontal, color: '#10b981' },
  mixed: { label: 'Mixed', icon: UserCheck, color: '#6366f1' },
  assessment: { label: 'Assessment', icon: UserCheck, color: '#3b82f6' },
}

const statusConfig = {
  scheduled: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  'no-show': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
]

export default function PortalPTSessionsPage() {
  const { data, isLoading } = useGetPortalPTSessionsQuery()
  const [bookSession, { isLoading: booking }] = useBookPortalPTSessionMutation()
  const [cancelSession] = useCancelPortalPTSessionMutation()
  const [showBooking, setShowBooking] = useState(false)
  const [form, setForm] = useState({
    trainerId: '', date: '', startTime: '', endTime: '', sessionType: 'mixed', notes: '',
  })

  const sessions = data?.data || []
  const trainers = data?.trainers || []

  const upcoming = sessions.filter((s) => s.status === 'scheduled' && new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
  const past = sessions.filter((s) => s.status !== 'scheduled' || new Date(s.date) < new Date(new Date().setHours(0, 0, 0, 0)))

  const handleBook = async (e) => {
    e.preventDefault()
    if (!form.trainerId || !form.date || !form.startTime || !form.endTime) {
      return toast.error('Please fill all required fields')
    }
    try {
      await bookSession(form).unwrap()
      toast.success('PT session booked! 💪')
      setForm({ trainerId: '', date: '', startTime: '', endTime: '', sessionType: 'mixed', notes: '' })
      setShowBooking(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to book session')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this PT session?')) return
    try {
      await cancelSession({ id, reason: 'Cancelled by member' }).unwrap()
      toast.success('Session cancelled')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel')
    }
  }

  const handleTimeSelect = (time) => {
    const hour = parseInt(time.split(':')[0])
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`
    setForm({ ...form, startTime: time, endTime })
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Personal Training Sessions</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Book and manage your PT sessions</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowBooking(!showBooking)}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
        >
          <Plus size={16} /> Book Session
        </button>
      </div>

      {/* Booking Form */}
      {showBooking && (
        <motion.div {...fadeUp} className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Book New Session</h3>
          <form onSubmit={handleBook}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="label">Trainer *</label>
                <SearchableSelect
                  options={trainers.map((t) => ({ value: t._id, label: t.name }))}
                  value={form.trainerId}
                  onChange={(val) => setForm({ ...form, trainerId: val })}
                  placeholder="Select trainer..."
                  searchPlaceholder="Search trainers..."
                />
              </div>
              <div className="form-group">
                <label className="label">Date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Session Type</label>
                <SearchableSelect
                  options={Object.entries(sessionTypeConfig).map(([key, val]) => ({ value: key, label: val.label }))}
                  value={form.sessionType}
                  onChange={(val) => setForm({ ...form, sessionType: val })}
                  placeholder="Select session type..."
                />
              </div>
            </div>

            {/* Time Slots */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">Time Slot *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {timeSlots.map((time) => {
                  const isSelected = form.startTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      style={{
                        padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1px solid #10b981' : '1px solid var(--color-bg-border)',
                        background: isSelected ? 'rgba(16,185,129,0.15)' : 'var(--color-bg-secondary)',
                        color: isSelected ? '#10b981' : 'var(--color-text-secondary)',
                        fontWeight: isSelected ? 600 : 400, fontSize: '0.8rem',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">Notes (optional)</label>
              <input className="input" placeholder="Any specific focus areas?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={booking} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
                {booking ? <Loader size={16} className="spin" /> : 'Book Session'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowBooking(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Upcoming Sessions */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
          Upcoming ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            No upcoming sessions. Book one above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {upcoming.map((s, i) => {
              const cfg = sessionTypeConfig[s.sessionType] || sessionTypeConfig.mixed
              const Icon = cfg.icon
              return (
                <motion.div
                  key={s._id}
                  {...fadeUp}
                  transition={{ delay: 0.05 * i }}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: cfg.color }} />
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {cfg.label} Training
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <UserCheck size={12} /> {s.trainerId?.name || 'Trainer'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {s.startTime} - {s.endTime}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(s._id)}
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Past Sessions */}
      {past.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Past Sessions</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trainer</th>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map((s) => {
                  const sc = statusConfig[s.status] || statusConfig.scheduled
                  return (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td>{s.trainerId?.name || '—'}</td>
                      <td>{sessionTypeConfig[s.sessionType]?.label || s.sessionType}</td>
                      <td>{s.startTime} - {s.endTime}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: 99,
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                          background: sc.bg, color: sc.color,
                        }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
