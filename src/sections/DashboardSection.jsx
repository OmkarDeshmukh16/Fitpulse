import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Fake live data generators
const getRandomDelta = (base, range) => base + Math.floor(Math.random() * range - range / 2)

const sidebarItems = [
  { icon: '⊞', label: 'Dashboard', active: true },
  { icon: '👥', label: 'Members' },
  { icon: '✓', label: 'Attendance' },
  { icon: '₹', label: 'Payments' },
  { icon: '🏋', label: 'Trainers' },
  { icon: '📊', label: 'Reports' },
  { icon: '⚙', label: 'Settings' },
]

function LiveNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay(getRandomDelta(value, Math.floor(value * 0.04)))
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(id)
  }, [value])
  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>
}

function MiniBarChart({ data, color = '#7C3AED' }) {
  const max = Math.max(...data)
  return (
    <svg viewBox={`0 0 ${data.length * 12} 40`} className="w-full h-10">
      {data.map((v, i) => {
        const h = (v / max) * 36
        return (
          <motion.rect
            key={i}
            x={i * 12 + 2}
            y={40 - h}
            width={8}
            height={h}
            rx={2}
            fill={color}
            fillOpacity={0.7}
            initial={{ height: 0, y: 40 }}
            animate={{ height: h, y: 40 - h }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        )
      })}
    </svg>
  )
}

function MiniLineChart({ color = '#7C3AED' }) {
  const points = [20, 35, 28, 45, 38, 52, 44, 60, 55, 70, 65, 80]
  const w = 180, h = 50
  const maxP = Math.max(...points)
  const minP = Math.min(...points)
  const toX = (i) => (i / (points.length - 1)) * w
  const toY = (v) => h - ((v - minP) / (maxP - minP)) * (h - 6) - 3
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  const fill = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ') + ` L ${w} ${h} L 0 ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#lg)" />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </svg>
  )
}

const activities = [
  { name: 'Rahul Sharma', action: 'New member joined', time: '10:35 AM', color: '#7C3AED' },
  { name: 'Payment received', action: '₹2,500 from Priya K.', time: '09:18 AM', color: '#10B981' },
  { name: 'Sneha Patel', action: 'Membership renewed', time: '08:52 AM', color: '#F59E0B' },
  { name: 'Arjun M.', action: 'Attendance checked in', time: '08:20 AM', color: '#3B82F6' },
]

export default function DashboardSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activityList, setActivityList] = useState(activities)

  // Simulate live activity feed
  useEffect(() => {
    const newActivities = [
      { name: 'Vikram R.', action: 'New member joined', time: 'Just now', color: '#7C3AED' },
      { name: 'Payment received', action: '₹3,000 from Kiran D.', time: 'Just now', color: '#10B981' },
      { name: 'Meera S.', action: 'Trial started', time: 'Just now', color: '#F59E0B' },
    ]
    let idx = 0
    const id = setInterval(() => {
      const newItem = newActivities[idx % newActivities.length]
      setActivityList(prev => [newItem, ...prev.slice(0, 3)])
      idx++
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const barData = [40, 65, 50, 80, 72, 90, 68, 85, 78, 95, 88, 100]

  return (
    <section
      id="dashboard"
      ref={ref}
      className="relative z-10 py-32 overflow-hidden"
      style={{
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Smarter Management
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            Your Gym, At a Glance
          </motion.h2>
          <motion.p className="text-white/45 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            A live dashboard that shows you everything — revenue, attendance, members, and more.
          </motion.p>
        </div>

        {/* Laptop mockup */}
        <motion.div
          className="relative mx-auto"
          style={{ maxWidth: 900 }}
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Laptop bezel */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background: '#0d0d0d',
              border: '2px solid rgba(255,255,255,0.08)',
              boxShadow: '0 60px 120px rgba(0,0,0,0.8), 0 0 60px rgba(124,58,237,0.08)',
            }}>

            {/* Screen top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <div className="flex-1 mx-4">
                <div className="h-5 glass rounded-md flex items-center justify-center px-3 mx-auto w-48">
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    fitpulse.app/dashboard
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex" style={{ minHeight: 480, background: '#080810' }}>
              {/* Sidebar */}
              <div className="w-40 border-r border-white/[0.05] p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2 p-2 mb-4">
                  <div className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: '#7C3AED' }}>
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <span className="text-white font-semibold text-xs" style={{ fontFamily: 'Clash Display, sans-serif' }}>Fitpulse</span>
                </div>
                {sidebarItems.map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-none"
                    style={{
                      background: item.active ? 'rgba(124,58,237,0.15)' : 'transparent',
                      color: item.active ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}>
                    <span className="text-sm">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm" style={{ fontFamily: 'Clash Display, sans-serif' }}>Dashboard</h3>
                  <span className="text-white/30 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>May 12 — May 18, 2025</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { label: 'Total Members', value: 1250, badge: '+8.2%', up: true, prefix: '' },
                    { label: 'Active Members', value: 1028, badge: '+6.1%', up: true, prefix: '' },
                    { label: "Today's Check-ins", value: 236, badge: '+4.3%', up: true, prefix: '' },
                    { label: 'Monthly Revenue', value: 148231, badge: '+9.4%', up: true, prefix: '₹' },
                    { label: 'Pending Payments', value: 18231, badge: '-2.1%', up: false, prefix: '₹' },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-xl p-2">
                      <div className="text-white/35 text-[9px] mb-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>{s.label}</div>
                      <div className="text-white font-bold text-sm" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                        <LiveNumber value={s.value} prefix={s.prefix} />
                      </div>
                      <div className={`text-[9px] mt-0.5 ${s.up ? 'text-emerald-400' : 'text-red-400'}`}
                        style={{ fontFamily: 'Satoshi, sans-serif' }}>
                        {s.badge}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-[10px]" style={{ fontFamily: 'Satoshi, sans-serif' }}>Revenue Overview</span>
                      <span className="text-purple-400 text-[10px]">This Week</span>
                    </div>
                    <MiniBarChart data={barData} />
                  </div>
                  <div className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-[10px]" style={{ fontFamily: 'Satoshi, sans-serif' }}>Attendance Trend</span>
                      <span className="text-emerald-400 text-[10px]">↑ Live</span>
                    </div>
                    <MiniLineChart color="#10B981" />
                  </div>
                </div>

                {/* Activity feed */}
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-[10px]" style={{ fontFamily: 'Satoshi, sans-serif' }}>Recent Activity</span>
                    <span className="text-purple-400 text-[10px] cursor-none">View All</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {activityList.slice(0, 3).map((a, i) => (
                      <motion.div
                        key={`${a.name}-${i}`}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                          style={{ background: a.color }}>
                          {a.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-[10px] truncate" style={{ fontFamily: 'Satoshi, sans-serif' }}>{a.name}</div>
                          <div className="text-white/35 text-[9px] truncate">{a.action}</div>
                        </div>
                        <span className="text-white/25 text-[9px] flex-shrink-0">{a.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glass shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, white 50%, transparent 70%)',
                  animation: 'shimmer 4s ease infinite',
                }}
              />
            </div>
          </div>

          {/* Laptop stand */}
          <div className="mx-auto mt-0 h-3 rounded-b-xl"
            style={{ width: '70%', background: 'linear-gradient(to bottom, #1a1a1a, #0d0d0d)' }} />
          <div className="mx-auto h-2 rounded-b-xl"
            style={{ width: '85%', background: '#0a0a0a', boxShadow: '0 20px 60px rgba(124,58,237,0.08)' }} />
        </motion.div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none opacity-[0.05]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(50px)' }} />
    </section>
  )
}
