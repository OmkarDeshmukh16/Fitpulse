import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'
import FloatingStatCards from '../components/ui/FloatingStatCards'

const avatarColors = ['#7C3AED', '#5B21B6', '#8B5CF6', '#6D28D9']

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center z-10 overflow-hidden"
      style={{
        paddingTop: 120,
        paddingBottom: 'clamp(32px, 6vw, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
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
                #1 Gym Management Software
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold leading-[1.02] tracking-tight text-white"
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
              className="text-lg md:text-xl leading-relaxed text-white/60 max-w-xl font-normal"
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
              className="flex flex-wrap gap-5 pt-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton variant="primary" size="xl">
                Book a Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </MagneticButton>
              <MagneticButton variant="ghost" size="xl">
                Explore Features
              </MagneticButton>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center gap-5 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.7 }}
            >
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {avatarColors.map((color, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, zIndex: 4 - i }}
                  >
                    {['A', 'R', 'S', 'M'][i]}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#050505] flex items-center justify-center text-xs font-bold text-white/60 glass">
                  +
                </div>
              </div>

              <div>
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/50 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                  Trusted by <span className="text-white font-medium">500+ gyms</span>
                </span>
              </div>
            </motion.div>

            {/* Quick stats row */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
            >
              {[
                { value: '50K+', label: 'Members managed' },
                { value: '₹2Cr+', label: 'Revenue processed' },
                { value: '99.9%', label: 'Uptime SLA' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-white font-bold text-xl md:text-2xl" style={{ fontFamily: 'Clash Display, sans-serif' }}>{s.value}</div>
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
