import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from './ui/MagneticButton'

const links = ['Features', 'Dashboard', 'Pricing', 'Testimonials']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[100] px-6 py-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{
        backdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
        background: scrolled ? 'rgba(5,5,5,0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-none"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-white">
              <rect x="2" y="10" width="20" height="4" rx="2" />
              <rect x="0" y="7" width="5" height="10" rx="2" />
              <rect x="19" y="7" width="5" height="10" rx="2" />
            </svg>
          </div>
          <span
            className="text-white font-bold text-lg tracking-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Fit<span style={{ color: '#7C3AED' }}>pulse</span>
          </span>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <div key={link} className="relative">
              <button
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 cursor-none"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
                onMouseEnter={() => setActiveLink(link)}
                onMouseLeave={() => setActiveLink(null)}
                onClick={() => {
                  const el = document.getElementById(link.toLowerCase())
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {link}
              </button>
              <AnimatePresence>
                {activeLink === link && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)' }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="text-white/60 hover:text-white text-sm font-medium transition-colors cursor-none px-4 py-2"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            Login
          </button>
          <MagneticButton variant="primary" className="text-sm">
            Book a Demo
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 cursor-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden glass mt-2 rounded-2xl mx-0"
          >
            <div className="flex flex-col p-4 gap-3">
              {links.map((link) => (
                <button key={link}
                  className="text-white/70 hover:text-white text-sm text-left py-2 border-b border-white/5 cursor-none"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                  onClick={() => {
                    setMenuOpen(false)
                    document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {link}
                </button>
              ))}
              <MagneticButton variant="primary" className="mt-2 w-full justify-center">
                Book a Demo
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
