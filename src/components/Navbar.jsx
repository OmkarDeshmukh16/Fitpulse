import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from './ui/MagneticButton'

// VITE_DASHBOARD_URL is optional when landing and dashboard are hosted together
const getDashboardUrl = () => {
  if (import.meta.env.VITE_DASHBOARD_URL) {
    return import.meta.env.VITE_DASHBOARD_URL
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}

const links = [
  { name: 'Features', id: 'features' },
  { name: 'Dashboard', id: 'dashboard' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Testimonials', id: 'testimonials' },
]

export default function Navbar({ onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-transparent'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div
        className="max-w-7xl w-full mx-auto flex items-center justify-between"
        style={{
          height: 28,
          paddingLeft: 'clamp(8px, 1.5vw, 28px)',
          paddingRight: 'clamp(8px, 1.5vw, 28px)',
        }}
      >
        {/* Brand Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-none flex-shrink-0"
          whileHover={{ scale: 1.03 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.35)] border border-purple-400/25"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
          >
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white">
              <rect x="2" y="10" width="20" height="4" rx="2" />
              <rect x="0" y="7" width="5" height="10" rx="2" />
              <rect x="19" y="7" width="5" height="10" rx="2" />
            </svg>
          </div>
          <span
            className="text-white font-bold text-sm tracking-tight"
            style={{ fontFamily: 'Clash Display, sans-serif', letterSpacing: '-0.01em' }}
          >
            Fit<span className="text-purple-400">pulse</span>
          </span>
        </motion.div>

        {/* Desktop Navigation Links — Plain transparent links, centered */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 absolute left-1/2 -translate-x-1/2">
          {links.map((link, idx) => (
            <button
              key={link.name}
              className={`relative text-[12px] font-medium transition-all duration-300 cursor-none group ${
                hoveredIndex === idx ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                const el = document.getElementById(link.id)
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {link.name}
              {/* Subtle underline on hover */}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <button
            className="text-white/65 text-[12px] font-medium hover:text-white transition-colors duration-200 cursor-none"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            onClick={() => {
              const url = getDashboardUrl()
              if (import.meta.env.VITE_DASHBOARD_URL) {
                window.open(`${url}/login`, '_blank')
              } else {
                window.location.href = `${url}/login`
              }
            }}
          >
            Login
          </button>
          <MagneticButton variant="primary" size="xs" onClick={onOpenDemo}>
            Book a Demo
          </MagneticButton>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-white cursor-none p-2 rounded-xl bg-white/[0.08] border border-white/15"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="md:hidden overflow-hidden glass-strong mt-4 rounded-3xl max-w-7xl w-full mx-auto border border-white/20 shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <button
                  key={link.name}
                  className="text-white text-xl font-bold text-left py-3 border-b border-white/10 cursor-none flex items-center justify-between"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                  onClick={() => {
                    setMenuOpen(false)
                    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <span>{link.name}</span>
                  <span className="text-purple-400 text-lg">→</span>
                </button>
              ))}
              <div className="flex flex-col gap-4 pt-4">
                <button
                  className="text-white text-base font-semibold py-3 rounded-2xl glass border border-white/20"
                  onClick={() => {
                    setMenuOpen(false)
                    const url = getDashboardUrl()
                    if (import.meta.env.VITE_DASHBOARD_URL) {
                      window.open(`${url}/login`, '_blank')
                    } else {
                      window.location.href = `${url}/login`
                    }
                  }}
                >
                  Login
                </button>
                <MagneticButton variant="primary" size="xl" className="w-full justify-center text-center text-xl py-4" onClick={() => { setMenuOpen(false); onOpenDemo(); }}>
                  Book a Demo
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
