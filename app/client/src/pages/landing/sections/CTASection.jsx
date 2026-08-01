import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative z-10 py-32 overflow-hidden flex flex-col items-center justify-center min-h-[70vh] text-center"
      style={{
        paddingTop: 'clamp(16px, 6vw, 100px)',
        paddingBottom: 'clamp(16px, 6vw, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      {/* Centered glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center relative z-10">

        <motion.span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-5"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Get Started Today
        </motion.span>

        <motion.h2 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          Ready to Transform
          <br />
          Your <span className="text-glow-purple">Gym?</span>
        </motion.h2>

        <motion.p className="text-white/45 text-lg mb-10"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
          Join 500+ gyms already growing with Fitpulse. Free for 14 days, no credit card needed.
        </motion.p>

        {/* Email form */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}>
          <input
            type="email"
            placeholder="Enter your work email..."
            className="w-full sm:w-80 px-6 py-4 rounded-full text-white text-base outline-none cursor-none border border-white/15 focus:border-purple-500/80 transition-colors shadow-inner"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              fontFamily: 'Satoshi, sans-serif',
            }}
          />
          <MagneticButton variant="primary" size="xl" className="w-full sm:w-auto">
            Start Free Trial
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </motion.div>

        <motion.p className="text-white/25 text-sm"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          No credit card required · Setup in 2 minutes · Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}
