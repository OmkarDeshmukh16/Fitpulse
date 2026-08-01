import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 999,
    annualPrice: 799,
    desc: 'Perfect for single-location gyms just getting started.',
    features: [
      'Up to 200 members',
      'Attendance tracking (QR)',
      'Basic payments & billing',
      'Member profiles',
      'Mobile app access',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 2499,
    annualPrice: 1999,
    desc: 'Everything a growing gym needs to scale operations.',
    features: [
      'Unlimited members',
      'QR + RFID attendance',
      'Advanced payments & dues',
      'Workout & diet plans',
      'Analytics & reports',
      'Trainer management',
      'Priority 24/7 support',
      'Custom branding',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    desc: 'Multi-branch gyms and franchises with custom requirements.',
    features: [
      'Unlimited branches',
      'All Pro features',
      'Custom API integrations',
      'Dedicated account manager',
      '99.9% SLA guarantee',
      'On-site onboarding',
      'White-label mobile app',
      'API access & webhooks',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section
      id="pricing"
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
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-12 w-full">
          <motion.span
            className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-purple-400 mb-5"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Simple & Transparent
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Invest in Your Gym's Growth
          </motion.h2>
          <motion.p
            className="text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed font-normal"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Choose the plan that fits your gym. Upgrade or cancel anytime with zero friction.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-5 mb-16 md:mb-20 px-6 py-3 rounded-full border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-base font-medium transition-colors cursor-none ${!annual ? 'text-white font-bold' : 'text-white/40'}`}
            style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Monthly
          </span>
          <button
            className="relative w-14 h-7 rounded-full cursor-none transition-colors duration-300 focus:outline-none"
            style={{ background: annual ? '#7C3AED' : 'rgba(255,255,255,0.15)' }}
            onClick={() => setAnnual(!annual)}
          >
            <motion.div
              className="absolute w-5 h-5 bg-white rounded-full top-1 shadow-md"
              animate={{ left: annual ? '32px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-base font-medium flex items-center gap-2.5 transition-colors cursor-none ${annual ? 'text-white font-bold' : 'text-white/40'}`}
            style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Annual
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
              Save 20%
            </span>
          </span>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 lg:gap-10 items-stretch w-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className="relative rounded-3xl p-8 lg:p-10 flex flex-col justify-between text-left cursor-none group transition-all duration-300"
              style={{
                background: plan.popular
                  ? 'linear-gradient(180deg, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.04) 100%)'
                  : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(24px)',
                border: plan.popular ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: plan.popular
                  ? '0 30px 90px rgba(124,58,237,0.3), 0 0 0 1px rgba(124,58,237,0.2)'
                  : '0 8px 32px rgba(0,0,0,0.4)',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                boxShadow: plan.popular
                  ? '0 40px 120px rgba(124,58,237,0.4), 0 0 0 1px rgba(167,139,250,0.4)'
                  : '0 20px 60px rgba(124,58,237,0.18), 0 0 0 1px rgba(255,255,255,0.15)',
                y: -8,
              }}
            >
              {/* Popular Pill Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div
                    className="px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.6)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}
                  >
                    ✦ Most Popular
                  </div>
                </div>
              )}

              <div>
                {/* Header info */}
                <div className="mb-8 border-b border-white/[0.08] pb-6">
                  <h3 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                    {plan.name}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    {plan.desc}
                  </p>
                </div>

                {/* Price block */}
                <div className="mb-8">
                  {plan.monthlyPrice ? (
                    <div className="flex items-baseline gap-2">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={annual ? 'annual' : 'monthly'}
                          className="text-5xl font-extrabold text-white tracking-tight"
                          style={{ fontFamily: 'Clash Display, sans-serif' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          ₹{annual ? plan.annualPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-white/40 text-base font-medium" style={{ fontFamily: 'Satoshi, sans-serif' }}>/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                      Custom Pricing
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="mb-10">
                  <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                    What's Included:
                  </div>
                  <ul className="flex flex-col gap-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.popular ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.08)' }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke={plan.popular ? '#A78BFA' : '#34D399'} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-white/80 text-sm font-medium" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <MagneticButton
                variant={plan.popular ? 'primary' : 'ghost'}
                size="xl"
                className="w-full justify-center text-center mt-auto"
              >
                {plan.cta}
              </MagneticButton>
            </motion.div>
          ))}
        </div>

        {/* Trust Footer line */}
        <motion.p
          className="text-center text-white/40 text-sm font-medium mt-16"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          All plans include 14-day free trial · No credit card required · Instant setup
        </motion.p>
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none opacity-[0.05]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(80px)' }}
      />
    </section>
  )
}
