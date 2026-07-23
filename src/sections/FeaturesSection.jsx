import { useRef, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Member Management',
    desc: 'Add, manage, and track members with full profile history, documents, and renewal alerts.',
    size: 'large',
    stat: '1,250 Members',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Attendance Tracking',
    desc: 'QR code, manual, and RFID attendance with real-time dashboards.',
    size: 'medium',
    stat: '236 Today',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Payments & Billing',
    desc: 'Collect dues, send receipts, track overdue, and automate reminders.',
    size: 'medium',
    stat: '₹1.48L / mo',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Workout Plans',
    desc: 'Build and assign custom workout programs to members with progress tracking.',
    size: 'large',
    stat: '320 Plans',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Reports & Analytics',
    desc: 'Revenue charts, attendance heatmaps, member growth — all in one view.',
    size: 'medium',
    stat: '12 Report Types',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    title: 'Diet Plans',
    desc: 'Create personalized nutrition plans, track calorie goals, and sync with workouts.',
    size: 'medium',
    stat: '180 Active Plans',
  },
]

function FeatureCard({ feature, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)

  const onMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14
    setTilt({ x, y })
  }, [])

  return (
    <motion.div
      ref={cardRef}
      className={`glass rounded-2xl p-6 relative overflow-hidden cursor-none group
        ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: hovered
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-6px)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: hovered ? 'transform 0.1s ease' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: hovered
          ? '0 20px 60px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.2)'
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
    >
      {hovered && (
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
          style={{ background: 'radial-gradient(circle at 50% 50%, #7C3AED, transparent 70%)' }}
        />
      )}
      {hovered && <div className="animated-border absolute inset-0 rounded-2xl pointer-events-none" />}

      <motion.div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400"
        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
        animate={hovered ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {feature.icon}
      </motion.div>

      <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>
        {feature.title}
      </h3>
      <p className="text-white/45 text-sm leading-relaxed" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {feature.desc}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'Satoshi, sans-serif' }}>
        <span className="w-1 h-1 rounded-full bg-purple-400" />
        {feature.stat}
      </div>

      {feature.size === 'large' && (
        <motion.div
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/20"
          style={{ background: 'rgba(255,255,255,0.04)' }}
          animate={hovered ? { x: 2, y: -2 } : {}}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 py-32 overflow-hidden"
      style={{
        paddingTop: 'clamp(16px, 6vw, 100px)',
        paddingBottom: 'clamp(16px, 6vw, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Everything You Need
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Built for Modern Gyms
          </motion.h2>
          <motion.p
            className="text-white/45 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Every tool a gym owner needs, beautifully integrated into one platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />
    </section>
  )
}
