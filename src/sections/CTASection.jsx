import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

export default function CTASection() {
  return (
    <section id="cta" className="relative z-10 py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2), transparent 70%)', filter: 'blur(40px)' }} />

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
        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}>
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 max-w-72 px-5 py-3.5 rounded-full text-white text-sm outline-none cursor-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              fontFamily: 'Satoshi, sans-serif',
            }}
          />
          <MagneticButton variant="primary">
            Start Free Trial
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
