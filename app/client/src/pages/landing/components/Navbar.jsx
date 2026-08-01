import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MagneticButton from './ui/MagneticButton'

const links = [
  { name: 'Features', id: 'features' },
  { name: 'Dashboard', id: 'dashboard' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'Testimonials', id: 'testimonials' },
]

export default function Navbar({ onOpenDemo }) {
  const navigate = useNavigate()
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
      className="fixed top-0 left-0 right-0 z-[100] py-6 md:py-8 flex justify-center items-center w-full"
      style={{
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div
        className={`max-w-7xl w-full mx-auto flex items-center justify-between px-8 sm:px-12 py-5 md:py-6 rounded-3xl md:rounded-full transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-[0_30px_90px_rgba(0,0,0,0.8),0_0_50px_rgba(124,58,237,0.2)] border border-white/20'
            : 'glass border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Brand Logo */}
        <motion.div
          className="flex items-center gap-4 cursor-none"
          whileHover={{ scale: 1.05 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.6)] border border-purple-400/40"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-white">
              <rect x="2" y="10" width="20" height="4" rx="2" />
              <rect x="0" y="7" width="5" height="10" rx="2" />
              <rect x="19" y="7" width="5" height="10" rx="2" />
            </svg>
          </div>
          <span
            className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Fit<span className="text-purple-400">pulse</span>
          </span>
        </motion.div>

        {/* Desktop Navigation Links — Modern Floating Glass Segmented Tabs */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-4 p-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl relative">
          {links.map((link, idx) => (
            <button
              key={link.name}
              className={`relative z-10 text-lg font-bold px-6 py-3 rounded-full transition-all duration-300 cursor-none flex items-center gap-2 ${
                hoveredIndex === idx ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                const el = document.getElementById(link.id)
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>{link.name}</span>

              {/* Sliding glass pill backdrop on hover */}
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="hover-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/30 to-purple-800/30 border border-purple-500/50 shadow-[0_0_25px_rgba(124,58,237,0.4)] pointer-events-none -z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            className="text-white text-lg font-bold transition-all duration-300 cursor-none px-8 py-3.5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/15 hover:border-purple-400/50 shadow-md"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <MagneticButton variant="primary" size="xl" onClick={onOpenDemo}>
            Book a Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-white cursor-none p-3 rounded-2xl bg-white/[0.08] border border-white/15"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex flex-col p-8 gap-6">
              {links.map((link) => (
                <button
                  key={link.name}
                  className="text-white text-2xl font-bold text-left py-3 border-b border-white/10 cursor-none flex items-center justify-between"
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
                  className="text-white text-xl font-bold py-4 rounded-2xl glass border border-white/20"
                  onClick={() => { setMenuOpen(false); navigate('/login') }}
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
