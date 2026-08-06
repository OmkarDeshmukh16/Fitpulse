import { motion } from 'framer-motion'

const FLOAT_VARIANTS = {
  float: (delay) => ({
    y: [0, -10, 0],
    transition: {
      duration: 3.5 + delay * 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: delay * 0.4,
    }
  })
}

const cards = [
  {
    label: "Today's Revenue",
    value: '₹45,231',
    badge: '+12.5%',
    badgeUp: true,
    icon: '₹',
    chart: true,
    delay: 0,
  },
  {
    label: 'Active Members',
    value: '1,250',
    badge: '+8.2%',
    badgeUp: true,
    icon: '👤',
    delay: 1,
  },
  {
    label: "Today's Attendance",
    value: '236',
    badge: '+4.3%',
    badgeUp: true,
    icon: '✓',
    delay: 2,
  },
  {
    label: 'Pending Payments',
    value: '₹18,231',
    badge: '-2.1%',
    badgeUp: false,
    icon: '⚠',
    delay: 3,
  },
]

export default function FloatingStatCards() {
  return (
    <div className="relative w-full h-full pointer-events-none select-none">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="absolute glass rounded-[20px] p-4 cursor-none pointer-events-auto"
          style={{
            width: i === 0 ? 240 : 210,
            top: i === 0 ? '8%' : i === 1 ? '2%' : i === 2 ? '55%' : '62%',
            right: i === 0 ? '5%' : i === 1 ? '42%' : i === 2 ? '2%' : '40%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.2 + card.delay * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          custom={card.delay}
          whileInView="float"
          variants={FLOAT_VARIANTS}
          whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.2)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              {card.label}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${card.badgeUp ? 'text-emerald-400' : 'text-red-400'}`}
              style={{ background: card.badgeUp ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)' }}
            >
              {card.badge}
            </span>
          </div>

          {/* Value */}
          <div className="text-white font-bold text-xl mb-2"
            style={{ fontFamily: 'Clash Display, sans-serif' }}>
            {card.value}
          </div>

          {/* Mini chart (for revenue card) */}
          {card.chart && (
            <svg viewBox="0 0 160 40" className="w-full h-8 mt-1">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,35 C20,30 30,20 50,18 C70,16 80,25 100,15 C120,5 140,12 160,8 L160,40 L0,40 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M0,35 C20,30 30,20 50,18 C70,16 80,25 100,15 C120,5 140,12 160,8"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  )
}
