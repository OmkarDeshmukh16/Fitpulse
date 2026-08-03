import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  Star,
  ArrowRight,
  ChevronRight
} from 'lucide-react'

// Set VITE_API_URL in Vercel env vars to your deployed backend URL (e.g. https://fitpulse-api.onrender.com/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const MEMBER_TIERS = [
  { label: '< 100', value: '<100' },
  { label: '100 - 300', value: '100-300' },
  { label: '300 - 500', value: '300-500' },
  { label: '500+', value: '500+' }
]

export default function BookDemoModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    memberCount: '100-300',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to submit demo request')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setForm({
      gymName: '',
      ownerName: '',
      email: '',
      phone: '',
      city: '',
      memberCount: '100-300',
      notes: ''
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-all"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-4xl rounded-3xl bg-[#090914]/95 border border-purple-500/30 shadow-[0_0_100px_rgba(124,58,237,0.25)] z-10 my-auto text-white backdrop-blur-3xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

            {/* Close Button */}
            <button
              onClick={handleReset}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-105 active:scale-95"
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto min-h-[420px] max-w-lg mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6"
                >
                  <CheckCircle2 size={44} />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  Demo Request Confirmed!
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Thank you, <span className="text-purple-400 font-bold">{form.ownerName}</span>! Our executive onboarding specialist will reach out to schedule your personalized live demo and setup guide for <span className="text-white font-semibold">{form.gymName}</span>.
                </p>
                <div className="w-full p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs sm:text-sm text-purple-200 flex items-center gap-3 text-left mb-8">
                  <div className="p-2 rounded-xl bg-purple-500/20 shrink-0 text-purple-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <span className="font-semibold block text-purple-100">What happens next?</span>
                    Expect an email & WhatsApp message within 2 business hours with your custom demo sandbox link.
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Return to Site
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
                {/* Left Panel: Feature Highlights & VIP Banner */}
                <div className="lg:col-span-5 bg-gradient-to-br from-purple-950/40 via-[#100c2a] to-[#0a0a18] p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
                  <div className="relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>Enterprise Demo Access</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-4" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                      Transform Your Gym into a Next-Gen Empire.
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-8">
                      Experience how Fitpulse automates memberships, biometric access control, payment collection, and revenue analytics in one sleek platform.
                    </p>

                    {/* Features list */}
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 mt-0.5">
                          <Zap size={13} />
                        </div>
                        <div>
                          <strong className="text-white block">15-Minute Live Walkthrough</strong>
                          Customized specifically to your gym size and branch requirements.
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
                          <ShieldCheck size={13} />
                        </div>
                        <div>
                          <strong className="text-white block">Hardware & Gate Sync Demo</strong>
                          See biometric scanners and auto-turnstile access in action.
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 mt-0.5">
                          <Dumbbell size={13} />
                        </div>
                        <div>
                          <strong className="text-white block">Tailored Pricing Strategy</strong>
                          Get a custom plan matching your active member count.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof Footer Card */}
                  <div className="relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 leading-snug">
                      "Fitpulse helped us double our renewal rate in 90 days. Onboarding took less than a day."
                    </p>
                    <span className="text-[11px] text-purple-400 font-semibold block mt-2">
                      — Premium Fitness Club Chain
                    </span>
                  </div>
                </div>

                {/* Right Panel: Form */}
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                        Book Your VIP Demo
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Fill in your details below and our team will get in touch immediately.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 animate-ping" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Grid 1: Gym Name & Owner Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Gym / Business Name <span className="text-purple-400">*</span>
                          </label>
                          <div className="relative">
                            <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={form.gymName}
                              onChange={e => set('gymName', e.target.value)}
                              placeholder="Titan Fitness Arena"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Your Full Name <span className="text-purple-400">*</span>
                          </label>
                          <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={form.ownerName}
                              onChange={e => set('ownerName', e.target.value)}
                              placeholder="Alex Morgan"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid 2: Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Work Email <span className="text-purple-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={e => set('email', e.target.value)}
                              placeholder="alex@titanfitness.com"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Phone / WhatsApp <span className="text-purple-400">*</span>
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              required
                              value={form.phone}
                              onChange={e => set('phone', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid 3: City & Active Member Count Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            City / Location
                          </label>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={form.city}
                              onChange={e => set('city', e.target.value)}
                              placeholder="Mumbai, IN"
                              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            Estimated Active Members
                          </label>
                          {/* Member Tier Pills Selector */}
                          <div className="grid grid-cols-2 gap-1.5">
                            {MEMBER_TIERS.map(tier => {
                              const isSelected = form.memberCount === tier.value
                              return (
                                <button
                                  key={tier.value}
                                  type="button"
                                  onClick={() => set('memberCount', tier.value)}
                                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all text-center border ${
                                    isSelected
                                      ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  {tier.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                          Specific Requirements or Questions
                        </label>
                        <textarea
                          rows={2}
                          value={form.notes}
                          onChange={e => set('notes', e.target.value)}
                          placeholder="Tell us about multi-branch setups, biometric hardware, or custom needs..."
                          className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-sm text-white placeholder-gray-500 transition-all resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing Request...
                          </>
                        ) : (
                          <>
                            <span>Request Custom Demo & Pricing</span>
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

