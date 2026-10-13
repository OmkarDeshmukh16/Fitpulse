import { useState } from 'react'
import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/$/, '')
  if (envUrl.endsWith('/api')) return envUrl
  return `${envUrl}/api`
}
const API_BASE_URL = getApiBaseUrl()

export default function CTASection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/demo-requests/free-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit free trial request.')
      }

      setSubmitted(true)
      setEmail('')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center relative z-10">
        <motion.span
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-5"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Get Started Today
        </motion.span>

        <motion.h2
          className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Ready to Transform
          <br />
          Your <span className="text-glow-purple">Gym?</span>
        </motion.h2>

        <motion.p
          className="text-white/45 text-lg mb-10 max-w-xl"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          Start your 14-day free trial. Experience seamless gym management with no credit card required.
        </motion.p>

        {/* Email form */}
        {submitted ? (
          <motion.div
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl glass border border-emerald-500/30 mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-white font-bold text-base" style={{ fontFamily: 'Clash Display, sans-serif' }}>
              Free Trial Request Received!
            </div>
            <p className="text-white/60 text-xs sm:text-sm text-center" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              Thank you for signing up. Our onboarding specialist will contact you with your access credentials shortly.
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4 max-w-xl mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              disabled={loading}
              placeholder="Enter your work email..."
              className="w-full sm:w-80 px-6 py-4 rounded-full text-white text-base outline-none cursor-none border border-white/15 focus:border-purple-500/80 transition-colors shadow-inner disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                fontFamily: 'Satoshi, sans-serif',
              }}
            />
            <MagneticButton
              variant="primary"
              size="xl"
              className="w-full sm:w-auto"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  Start Free Trial
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </MagneticButton>
          </motion.form>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-400 text-xs sm:text-sm font-medium mb-6 flex items-center gap-2"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {error}
          </motion.div>
        )}

        <motion.p
          className="text-white/25 text-sm"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          No credit card required · Setup in 2 minutes · Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}
