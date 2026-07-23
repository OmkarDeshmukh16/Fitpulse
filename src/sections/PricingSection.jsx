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
      'Priority support',
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
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-site onboarding',
      'White-label option',
      'API access',
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
      className="relative z-10 py-32 overflow-hidden"
      style={{
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
        paddingTop: 'clamp(16px, 6vw, 100px)',
        paddingBottom: 'clamp(16px, 6vw, 100px)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <motion.span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Simple Pricing
          </motion.span>
          <motion.h2 className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            Invest in Your Gym's Growth
          </motion.h2>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8 pb-12">
            <span className={`text-base font-medium ${!annual ? 'text-white' : 'text-white/40'}`}
              style={{ fontFamily: 'Satoshi, sans-serif' }}>Monthly</span>
            <button
              className="relative w-14 h-7 rounded-full cursor-none transition-colors duration-300"
              style={{ background: annual ? '#7C3AED' : 'rgba(255,255,255,0.12)' }}
              onClick={() => setAnnual(!annual)}
            >
              <motion.div
                className="absolute w-5 h-5 bg-white rounded-full top-1"
                animate={{ left: annual ? '32px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-base font-medium flex items-center gap-2.5 ${annual ? 'text-white' : 'text-white/40'}`}
              style={{ fontFamily: 'Satoshi, sans-serif' }}>
              Annual
              {annual && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }}>
                  Save 20%
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6 mt-12 md:mt-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className="relative rounded-3xl p-8 flex flex-col justify-between cursor-none"
              style={{
                background: plan.popular ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: plan.popular ? '1px solid rgba(124,58,237,0.45)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: plan.popular
                  ? '0 30px 90px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.2)'
                  : '0 8px 30px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                boxShadow: plan.popular
                  ? '0 40px 110px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.3)'
                  : '0 20px 60px rgba(124,58,237,0.15), 0 0 0 1px rgba(124,58,237,0.2)',
                y: -6,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
                      fontFamily: 'Satoshi, sans-serif',
                    }}>
                    ✦ Most Popular
                  </div>
                </div>
              )}

              {/* Animated border for popular */}
              {plan.popular && (
                <div className="animated-border absolute inset-0 rounded-2xl pointer-events-none opacity-40" />
              )}

              {/* Plan name */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  {plan.name}
                </h3>
                <p className="text-white/40 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-7">
                {plan.monthlyPrice ? (
                  <div className="flex items-end gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={annual ? 'annual' : 'monthly'}
                        className="text-4xl font-bold text-white"
                        style={{ fontFamily: 'Clash Display, sans-serif' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        ₹{annual ? plan.annualPrice : plan.monthlyPrice}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-white/35 text-sm mb-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>/mo</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                    Custom
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.popular ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)' }}>
                      <svg className="w-2.5 h-2.5" fill="none" stroke={plan.popular ? '#A78BFA' : 'rgba(255,255,255,0.5)'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/60 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton variant={plan.popular ? 'primary' : 'ghost'} size="lg" className="w-full justify-center text-center">
                {plan.cta}
              </MagneticButton>
            </motion.div>
          ))}
        </div>

        {/* Trust line */}
        <motion.p className="text-center text-white/30 text-sm mt-12"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          All plans include 14-day free trial · No credit card required · Cancel anytime
        </motion.p>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />
    </section>
  )
}
