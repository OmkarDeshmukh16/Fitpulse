import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 500, suffix: '+', label: 'Gyms Worldwide', prefix: '' },
  { value: 2, suffix: 'Cr+', label: 'Revenue Processed', prefix: '₹' },
  { value: 50, suffix: 'K+', label: 'Members Managed', prefix: '' },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', prefix: '' },
]

function StatCounter({ stat, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const numRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current || !numRef.current) return
    hasAnimated.current = true
    const obj = { val: 0 }
    gsap.to(obj, {
      val: stat.value,
      duration: 2.2,
      ease: 'power3.out',
      delay: index * 0.15,
      onUpdate: () => {
        if (numRef.current) {
          const display = stat.value % 1 !== 0
            ? obj.val.toFixed(1)
            : Math.floor(obj.val)
          numRef.current.textContent = `${stat.prefix}${display}${stat.suffix}`
        }
      },
    })
  }, [inView, stat, index])

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center group cursor-none"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={numRef}
        className="text-5xl md:text-6xl font-bold text-white mb-3"
        style={{ fontFamily: 'Clash Display, sans-serif' }}
      >
        {stat.prefix}0{stat.suffix}
      </div>

      {/* Purple glow underline */}
      <div className="w-12 h-px mb-3 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)' }} />

      <div className="text-white/45 text-sm" style={{ fontFamily: 'Satoshi, sans-serif' }}>
        {stat.label}
      </div>
    </motion.div>
  )
}

export default function StatsSection() {
  return (
    <section id="stats" className="relative z-10 py-24 px-6">
      {/* Background separator */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.03), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          className="glass rounded-3xl p-12 md:p-16"
          style={{ boxShadow: '0 0 80px rgba(124,58,237,0.06), 0 0 0 1px rgba(255,255,255,0.04)' }}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-12">
            <motion.span className="text-xs font-semibold tracking-[0.2em] uppercase text-purple-400"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              By The Numbers
            </motion.span>
            <motion.h2 className="text-3xl md:text-4xl font-bold text-white mt-3"
              style={{ fontFamily: 'Clash Display, sans-serif' }}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.7 }}>
              Gyms Love Fitpulse
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, i) => (
              <StatCounter key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
