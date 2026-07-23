import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from './ui/MagneticButton'

const links = ['Features', 'Dashboard', 'Pricing', 'Testimonials']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] py-4 md:py-6"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-3.5 md:py-4 rounded-full transition-all duration-500 ${
          scrolled
            ? 'glass-strong shadow-[0_16px_40px_rgba(0,0,0,0.6)] border border-white/10'
            : 'glass border border-white/[0.06]'
        }`}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-none"
          whileHover={{ scale: 1.03 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-white">
              <rect x="2" y="10" width="20" height="4" rx="2" />
              <rect x="0" y="7" width="5" height="10" rx="2" />
              <rect x="19" y="7" width="5" height="10" rx="2" />
            </svg>
          </div>
          <span
            className="text-white font-bold text-xl md:text-2xl tracking-tight"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Fit<span className="text-purple-400">pulse</span>
          </span>
        </motion.div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
          {links.map((link) => (
            <div key={link} className="relative">
              <button
                className="text-white/70 hover:text-white text-base font-medium transition-colors duration-200 cursor-none px-4 py-2 rounded-full hover:bg-white/[0.06]"
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
                    className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #A78BFA)' }}
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
        <div className="hidden md:flex items-center gap-4">
          <button
            className="text-white/80 hover:text-white text-base font-semibold transition-all cursor-none px-6 py-3 rounded-full hover:bg-white/10 border border-transparent hover:border-white/10"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            Login
          </button>
          <MagneticButton variant="primary" size="md">
            Book a Demo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/80 cursor-none p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="md:hidden overflow-hidden glass-strong mt-3 rounded-3xl max-w-7xl mx-auto border border-white/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link) => (
                <button key={link}
                  className="text-white/80 hover:text-white text-lg font-medium text-left py-2 border-b border-white/10 cursor-none"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                  onClick={() => {
                    setMenuOpen(false)
                    document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {link}
                </button>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <button className="text-white/80 hover:text-white text-base py-3 rounded-xl glass border border-white/10">
                  Login
                </button>
                <MagneticButton variant="primary" className="w-full justify-center text-base py-3.5">
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
