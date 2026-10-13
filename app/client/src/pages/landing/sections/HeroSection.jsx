import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'
import FloatingStatCards from '../components/ui/FloatingStatCards'

export default function HeroSection({ onOpenDemo }) {
  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-4rem)] flex items-center z-10 overflow-hidden"
      style={{
        paddingTop: 80,
        paddingBottom: 'clamp(24px, 6vw, 80px)',
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-100px)] py-12 md:py-20">

          {/* LEFT: Content */}
          <div className="flex flex-col gap-8 relative z-10 max-w-2xl">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="inline-flex items-center gap-2.5 glass px-5 py-2 rounded-full text-xs md:text-sm font-medium text-white/80 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                All-in-One Gym Management Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight text-white"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Manage Your Gym.
              <br />
              Grow Your{' '}
              <span className="text-glow-purple">Business.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base md:text-lg leading-relaxed text-white/70 max-w-xl font-normal"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              All-in-one software for memberships, attendance, payments, trainers,
              workout plans, analytics, and gym operations — built for growth.
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 pt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton variant="primary" size="md" onClick={onOpenDemo}>
                Book a Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </MagneticButton>
              <MagneticButton variant="ghost" size="md">
                Explore Features
              </MagneticButton>
            </motion.div>

            {/* Product capabilities highlight */}
            <motion.div
              className="flex items-center gap-3 pt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.7 }}
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/60 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                Engineered for fitness centers, studios, and gym operations
              </span>
            </motion.div>

            {/* Platform pillars row */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
            >
              {[
                { value: 'Unified', label: 'Member Management' },
                { value: 'Instant', label: 'QR Attendance' },
                { value: 'Integrated', label: 'Billing & Records' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-white font-bold text-lg md:text-xl" style={{ fontFamily: 'Clash Display, sans-serif' }}>{s.value}</div>
                  <div className="text-white/40 text-xs md:text-sm mt-0.5" style={{ fontFamily: 'Satoshi, sans-serif' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Floating stat cards over 3D scene */}
          <div className="relative h-[550px] hidden lg:block">
            <FloatingStatCards />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(5,5,5,0.7))' }}
      />
    </section>
  )
}
