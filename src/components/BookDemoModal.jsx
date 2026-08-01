import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, X, CheckCircle2, Loader2, Sparkles, Building2, User, Mail, Phone, MapPin, Users } from 'lucide-react'

// Set VITE_API_URL in Vercel env vars to your deployed backend URL (e.g. https://fitpulse-api.onrender.com/api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function BookDemoModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    memberCount: '100-300',
    notes: '',
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
        body: JSON.stringify(form),
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
      notes: '',
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-xl rounded-3xl bg-[#0f0f23]/90 border border-purple-500/30 p-6 sm:p-8 shadow-[0_0_80px_rgba(124,58,237,0.3)] z-10 my-auto text-white backdrop-blur-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleReset}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="py-8 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                  Demo Request Received!
                </h2>
                <p className="text-gray-300 text-sm sm:text-base max-w-md leading-relaxed">
                  Thank you, <span className="text-purple-400 font-semibold">{form.ownerName}</span>! Our onboarding team will contact you shortly and send a custom payment link for <span className="text-white font-semibold">{form.gymName}</span>.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                  ⚡ Check your inbox or phone for your payment & setup instructions.
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Clash Display, sans-serif' }}>
                      Request a Personal Demo
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400">Get your gym onboarded to Fitpulse SaaS</p>
                  </div>
                </div>

                {error && (
                  <div className="my-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gym Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Gym / Business Name *</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={form.gymName}
                          onChange={e => set('gymName', e.target.value)}
                          placeholder="Titan Fitness"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Owner Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Your Full Name *</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          required
                          value={form.ownerName}
                          onChange={e => set('ownerName', e.target.value)}
                          placeholder="Alex Morgan"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Work Email *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          placeholder="alex@titanfitness.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Phone / WhatsApp *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={e => set('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">City / Location</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          placeholder="Mumbai"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Estimated Members */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Active Members Estimate</label>
                      <div className="relative">
                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                          value={form.memberCount}
                          onChange={e => set('memberCount', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#161632] border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white transition-colors"
                        >
                          <option value="<100">Less than 100 members</option>
                          <option value="100-300">100 - 300 members</option>
                          <option value="300-500">300 - 500 members</option>
                          <option value="500+">500+ members</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Additional Requirements / Notes</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      placeholder="Tell us about your gym features, multiple branches, or specific needs..."
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      'Request Custom Demo & Payment Link'
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
