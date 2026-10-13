import { motion } from 'framer-motion'

const pillars = [
  {
    title: 'Complete Member Management',
    desc: 'Maintain organized member profiles, emergency contact details, assigned membership tiers, document attachments, and renewal schedules in a unified database.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'QR & Manual Attendance',
    desc: 'Facilitate fast, contactless front-desk check-ins via instant QR code scanning or manual entry logs, with daily attendance tracking and live records.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    title: 'Payments & Fee Tracking',
    desc: 'Record membership fee collections, track outstanding dues, record payment methods, and issue receipts for clear financial transparency.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: 'Workout & Diet Planning',
    desc: 'Build customized exercise routines, target muscle groups, and design balanced nutrition meal plans tailored to member fitness goals.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Operational Reports & Analytics',
    desc: 'Gain real-time visibility into active member counts, renewal trends, attendance distributions, and revenue collections with exportable reports.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Member Self-Service Portal',
    desc: 'Provide gym members with self-service login access to verify active plan duration, review attendance logs, and follow their assigned workout charts.',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 py-32 overflow-hidden flex flex-col items-center justify-center text-center w-full"
      style={{
        paddingTop: 'clamp(40px, 7vw, 120px)',
        paddingBottom: 'clamp(40px, 7vw, 120px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-16 w-full">
          <motion.span
            className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-purple-400 mb-5"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            About Fitpulse
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            A Unified Platform for Gym Operations
          </motion.h2>
          <motion.p
            className="text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed font-normal"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Fitpulse is a gym management software platform built to help fitness facility owners, front-desk staff, and trainers manage daily gym operations from one integrated system.
          </motion.p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              className="glass rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300 hover:border-purple-500/40"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(124,58,237,0.18), 0 0 0 1px rgba(124,58,237,0.3)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                {pillar.icon}
              </div>
              <h3
                className="text-white font-bold text-lg mb-2"
                style={{ fontFamily: 'Clash Display, sans-serif' }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-white/50 text-sm leading-relaxed"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background glow backdrop */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(70px)' }}
      />
    </section>
  )
}
