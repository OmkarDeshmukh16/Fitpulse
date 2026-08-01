import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('logo') // logo | loading | reveal
  const intervalRef = useRef(null)

  useEffect(() => {
    // Phase 1: Show logo for 600ms then start loading
    const t1 = setTimeout(() => setPhase('loading'), 600)

    // Phase 2: Fill progress bar
    const t2 = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalRef.current)
            return 100
          }
          return prev + Math.random() * 4 + 1.5
        })
      }, 40)
    }, 900)

    // Phase 3: Reveal
    const t3 = setTimeout(() => {
      setPhase('reveal')
      setTimeout(onComplete, 800)
    }, 3400)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearInterval(intervalRef.current)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: '#050505' }}
        exit={{
          clipPath: 'inset(0 0 100% 0)',
          transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
        }}
      >
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        {/* Purple glow in center */}
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          {/* Logo Icon - Animated weight plate */}
          <motion.div
            className="relative w-20 h-20 flex items-center justify-center"
            animate={phase === 'loading' ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 80 80" className="w-full h-full">
              {/* Outer ring */}
              <circle cx="40" cy="40" r="36" fill="none" stroke="#7C3AED" strokeWidth="3" opacity="0.4" />
              {/* Progress arc */}
              <circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(progress, 100) / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.1s ease' }}
              />
              {/* Center dumbbell icon */}
              <g transform="translate(40,40)">
                {/* Bar */}
                <rect x="-14" y="-2" width="28" height="4" rx="2" fill="#ffffff" />
                {/* Left plate */}
                <rect x="-18" y="-8" width="5" height="16" rx="2" fill="#7C3AED" />
                {/* Right plate */}
                <rect x="13" y="-8" width="5" height="16" rx="2" fill="#7C3AED" />
              </g>
            </svg>
          </motion.div>

          {/* Brand name */}
          <motion.div className="text-center">
            <div
              className="text-4xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'Clash Display, sans-serif', letterSpacing: '-0.02em' }}
            >
              FIT<span style={{ color: '#7C3AED' }}>PULSE</span>
            </div>
            <div className="text-xs tracking-[0.3em] uppercase text-white/30 mt-1">
              Gym Management
            </div>
          </motion.div>

          {/* Progress bar */}
          <AnimatePresence>
            {phase === 'loading' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-48 flex flex-col items-center gap-2"
              >
                <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: 'linear-gradient(90deg, #5B21B6, #7C3AED)',
                    }}
                  />
                </div>
                <span className="text-white/30 text-xs font-mono">
                  {Math.min(Math.floor(progress), 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
