import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, TrendingUp, Dumbbell, UserCheck, Award, ArrowRight, Flame, Zap, QrCode, X, Download, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetPortalDashboardQuery } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function PortalDashboardPage() {
  const navigate = useNavigate()
  const [showQRModal, setShowQRModal] = useState(false)
  const { data, isLoading } = useGetPortalDashboardQuery()
  const d = data?.data

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  const stats = [
    { label: 'Days Remaining', value: d?.stats?.daysRemaining ?? '—', icon: Award, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Attendance Streak', value: `${d?.stats?.streak ?? 0} days`, icon: Flame, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Workouts This Month', value: d?.stats?.attendanceThisMonth ?? 0, icon: Dumbbell, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Upcoming PT', value: d?.stats?.upcomingPTCount ?? 0, icon: UserCheck, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  ]

  const quickActions = [
    { label: 'My Digital QR Pass', action: () => setShowQRModal(true), icon: QrCode, color: '#10b981' },
    { label: 'Renew Membership', to: '/portal/membership', icon: Award, color: '#6366f1' },
    { label: 'Book PT Session', to: '/portal/pt-sessions', icon: UserCheck, color: '#f59e0b' },
    { label: 'View Attendance', to: '/portal/attendance', icon: CalendarCheck, color: '#3b82f6' },
  ]


  // Mini calendar - last 30 days
  const today = new Date()
  const last30 = []
  for (let i = 29; i >= 0; i--) {
    const d2 = new Date(today)
    d2.setDate(d2.getDate() - i)
    last30.push(d2.toISOString().split('T')[0])
  }
  const attendedDates = new Set(d?.last30Attendance || [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome Banner */}
      <motion.div {...fadeUp} transition={{ delay: 0 }} style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
          Welcome back, {d?.member?.fullName?.split(' ')[0] || 'Member'}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          {d?.membership
            ? <>Your <span style={{ color: '#10b981', fontWeight: 600 }}>{d.membership.planName}</span> membership is {d.membership.status}. {d.stats.daysRemaining > 0 ? `${d.stats.daysRemaining} days remaining.` : 'Time to renew!'}</>
            : 'No active membership. Renew now to get started!'
          }
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
            background: d?.member?.membershipStatus === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: d?.member?.membershipStatus === 'active' ? '#10b981' : '#ef4444',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <Zap size={12} />
            {d?.member?.membershipStatus || 'inactive'}
          </div>

          <button
            className="btn btn-primary"
            style={{
              fontSize: '0.825rem', padding: '0.45rem 1rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            }}
            onClick={() => setShowQRModal(true)}
          >
            <QrCode size={15} /> Show My QR Pass
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp} transition={{ delay: 0.05 * (i + 1) }} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Quick Actions */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  if (a.action) a.action()
                  else if (a.to) navigate(a.to)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                  padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)',
                  color: 'var(--color-text-primary)', cursor: 'pointer',
                  transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: 500,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = 'var(--color-bg-hover)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-bg-border)'; e.currentTarget.style.background = 'var(--color-bg-secondary)' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a.icon size={16} color={a.color} />
                </div>
                <span style={{ flex: 1 }}>{a.label}</span>
                <ArrowRight size={14} color="var(--color-text-muted)" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mini Attendance Calendar */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Last 30 Days Attendance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d3, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '0.25rem 0' }}>{d3}</div>
            ))}
            {last30.map((date) => {
              const attended = attendedDates.has(date)
              const isToday = date === today.toISOString().split('T')[0]
              return (
                <div
                  key={date}
                  title={date}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 6,
                    background: attended ? 'rgba(16,185,129,0.25)' : 'var(--color-bg-secondary)',
                    border: isToday ? '2px solid #10b981' : '1px solid var(--color-bg-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', color: attended ? '#10b981' : 'var(--color-text-muted)',
                    fontWeight: attended ? 700 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  {new Date(date).getDate()}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(16,185,129,0.25)' }} />
              Present
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)' }} />
              Absent
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming PT Sessions */}
      {d?.upcomingPT?.length > 0 && (
        <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Upcoming PT Sessions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {d.upcomingPT.map((pt) => (
              <div key={pt._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={18} color="#6366f1" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {pt.sessionType?.charAt(0).toUpperCase() + pt.sessionType?.slice(1)} Training
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    with {pt.trainerId?.name || 'Trainer'} · {pt.startTime} - {pt.endTime}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {new Date(pt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DIGITAL QR GYM PASS MODAL */}
      <AnimatePresence>
        {showQRModal && (
          <div className="modal-overlay" onClick={() => setShowQRModal(false)} style={{ zIndex: 100 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal"
              style={{
                maxWidth: 380, width: '90%', textAlign: 'center', padding: '2rem',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-bg-border)',
                borderRadius: 'var(--radius-xl)', boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Digital Gym Pass
                  </span>
                </div>
                <button className="btn btn-ghost" onClick={() => setShowQRModal(false)} style={{ padding: '0.3rem', borderRadius: 8 }}>
                  <X size={16} />
                </button>
              </div>

              {/* QR Image Box */}
              <div style={{
                background: '#ffffff', borderRadius: 16, padding: '1.25rem',
                margin: '0 auto 1.25rem', width: 220, height: 220,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}>
                {d?.member?.qrCode ? (
                  <img src={d.member.qrCode} alt="Member QR Pass" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: 600 }}>
                    Generating QR Pass...
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                {d?.member?.fullName}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                ID: {d?.member?.memberId}
              </p>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.75rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                background: d?.member?.membershipStatus === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: d?.member?.membershipStatus === 'active' ? '#10b981' : '#ef4444',
                marginBottom: '1.25rem',
              }}>
                Plan: {d?.membership?.planName || 'Standard'} • {d?.member?.membershipStatus?.toUpperCase()}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Show this QR Code to the front desk scanner or tablet to mark your attendance.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

