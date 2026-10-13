import { motion } from 'framer-motion'

const platformHighlights = [
  {
    quote: "Store complete member details, membership plan validity, documents, and renewal history in one centralized system.",
    name: "Member Profiles",
    module: "Member Management",
    iconLabel: "MEM",
    color: "#7C3AED",
  },
  {
    quote: "Fast QR code scanning for touchless member check-ins alongside manual check-in options with real-time logs.",
    name: "QR & Manual Check-In",
    module: "Attendance System",
    iconLabel: "ATT",
    color: "#5B21B6",
  },
  {
    quote: "Record payments, manage outstanding membership dues, view transaction histories, and generate digital receipts.",
    name: "Billing & Invoices",
    module: "Payment Management",
    iconLabel: "PAY",
    color: "#8B5CF6",
  },
  {
    quote: "Build custom workout schedules with specific exercises, sets, reps, and target muscle groups assigned to members.",
    name: "Workout Builder",
    module: "Workout Planning",
    iconLabel: "WKT",
    color: "#6D28D9",
  },
  {
    quote: "Create balanced nutrition charts and meal breakdowns tailored to support member fitness and health goals.",
    name: "Nutrition Schedules",
    module: "Diet & Nutrition",
    iconLabel: "DET",
    color: "#7C3AED",
  },
  {
    quote: "Generate actionable reports on active memberships, attendance patterns, and revenue collections to track gym performance.",
    name: "Operational Reports",
    module: "Reports & Analytics",
    iconLabel: "REP",
    color: "#5B21B6",
  },
  {
    quote: "Provide members with dedicated portal access to view their active plan details, attendance records, and workout plans.",
    name: "Member Portal",
    module: "Self-Service Access",
    iconLabel: "POR",
    color: "#8B5CF6",
  },
  {
    quote: "Schedule, log, and monitor personal training sessions with assigned gym trainers and track member progress.",
    name: "Trainer Sessions",
    module: "Personal Training",
    iconLabel: "PTS",
    color: "#6D28D9",
  },
]

function HighlightCard({ t }) {
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
      {/* Module badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.3)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {t.module}
        </span>
      </div>

      {/* Description */}
      <p className="text-white/65 text-sm leading-relaxed mb-4"
        style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {t.quote}
      </p>

      {/* Feature block */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
          {t.iconLabel}
        </div>
        <div>
          <div className="text-white font-semibold text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>{t.name}</div>
          <div className="text-white/35 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>Fitpulse Core Platform</div>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const doubled = [...platformHighlights, ...platformHighlights]

  return (
    <section
      id="testimonials"
      className="relative z-10 py-28 overflow-hidden flex flex-col items-center justify-center text-center w-full"
      style={{
        paddingTop: 'clamp(32px, 6vw, 100px)',
        paddingBottom: 'clamp(32px, 6vw, 100px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-20 w-full">
          <motion.span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-purple-400 mb-5"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Platform Capabilities
          </motion.span>
          <motion.h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            Engineered for Daily Gym Operations
          </motion.h2>
          <motion.p className="text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed font-normal"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            Practical workflows designed to simplify front-desk operations, member tracking, and fitness planning.
          </motion.p>
        </div>

        {/* Row 1 — left */}
        <div style={{ paddingBottom: 'clamp(2px, 3vw, 50px)' }}
          className="relative overflow-hidden mb-4">
          <div className="flex marquee-left" style={{ width: 'max-content' }}>
            {doubled.map((t, i) => <HighlightCard key={i} t={t} />)}
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="relative overflow-hidden">
          <div className="flex marquee-right" style={{ width: 'max-content' }}>
            {[...doubled].reverse().map((t, i) => <HighlightCard key={i} t={t} />)}
          </div>
        </div>

        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, #050505, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, #050505, transparent)' }} />
      </div>
    </section>
  )
}
