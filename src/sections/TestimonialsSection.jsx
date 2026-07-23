import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "Fitpulse transformed how we run our gym. Revenue tracking alone saved us 5 hours a week.",
    name: "Aditya Sharma",
    title: "Owner, IronZone Fitness",
    initials: "AS",
    color: "#7C3AED",
    stars: 5,
  },
  {
    quote: "The attendance system is flawless. Members love the QR check-in and we love the real-time data.",
    name: "Priya Nair",
    title: "Manager, PulseGym Mumbai",
    initials: "PN",
    color: "#5B21B6",
    stars: 5,
  },
  {
    quote: "Switching from spreadsheets to Fitpulse was the best decision. Setup took less than a day.",
    name: "Rahul Deshmukh",
    title: "Founder, FitCore Pune",
    initials: "RD",
    color: "#8B5CF6",
    stars: 5,
  },
  {
    quote: "The workout plan builder is incredible. Our trainers save 2 hours daily creating programs.",
    name: "Sneha Kulkarni",
    title: "Head Trainer, EliteFit",
    initials: "SK",
    color: "#6D28D9",
    stars: 5,
  },
  {
    quote: "Payment reminders alone recovered ₹80,000 in dues we had written off. Incredible ROI.",
    name: "Vikram Mehta",
    title: "Owner, Strength Studio",
    initials: "VM",
    color: "#7C3AED",
    stars: 5,
  },
  {
    quote: "Multi-branch management is seamless. All our 3 locations on one dashboard, live.",
    name: "Kavita Joshi",
    title: "Director, FlexChain Gyms",
    initials: "KJ",
    color: "#5B21B6",
    stars: 5,
  },
  {
    quote: "The reports give us insights we never had. We grew memberships 40% in 6 months using the data.",
    name: "Arjun Pillai",
    title: "Owner, ProFit Bangalore",
    initials: "AP",
    color: "#8B5CF6",
    stars: 5,
  },
  {
    quote: "Customer support is exceptional. Any issue resolved within the hour. 10/10 product.",
    name: "Meera Reddy",
    title: "Owner, Fit Factory Hyderabad",
    initials: "MR",
    color: "#6D28D9",
    stars: 5,
  },
]

function TestimonialCard({ t }) {
  return (
    <div
      className="glass rounded-2xl p-6 flex-shrink-0 cursor-none"
      style={{
        width: 320,
        margin: '0 10px',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `2px solid ${t.color}`,
      }}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: t.stars }, (_, i) => (
          <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-white/65 text-sm leading-relaxed mb-4"
        style={{ fontFamily: 'Satoshi, sans-serif' }}>
        "{t.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
          {t.initials}
        </div>
        <div>
          <div className="text-white font-semibold text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>{t.name}</div>
          <div className="text-white/35 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>{t.title}</div>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const doubled = [...testimonials, ...testimonials]

  return (
    <section
      id="testimonials"
      className="relative z-10 py-28 overflow-hidden"
      style={{
        paddingTop: 'clamp(16px, 6vw, 100px)',
        paddingBottom: 'clamp(16px, 6vw, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto text-center mb-14">
        <motion.span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 mb-4"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Loved by Gym Owners
        </motion.span>
        <motion.h2 className="text-4xl md:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          500+ Gyms Can't Be Wrong
        </motion.h2>
        <motion.p className="text-white/45 text-lg max-w-xl mx-auto"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
          Real stories from real gym owners growing with Fitpulse.
        </motion.p>
      </div>

      {/* Row 1 — left */}
      <div className="relative overflow-hidden mb-4">
        <div className="flex marquee-left" style={{ width: 'max-content' }}>
          {doubled.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>

      {/* Row 2 — right */}
      <div className="relative overflow-hidden">
        <div className="flex marquee-right" style={{ width: 'max-content' }}>
          {[...doubled].reverse().map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
      </div>

      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, #050505, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to left, #050505, transparent)' }} />
    </section>
  )
}
