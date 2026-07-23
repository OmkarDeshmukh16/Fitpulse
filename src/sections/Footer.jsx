import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

const footerLinks = {
  Product: ['Features', 'Dashboard', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Docs', 'API Reference', 'Community', 'Help Center', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export default function Footer() {
  return (
    <footer id="footer" className="relative z-10 pt-20 pb-10 px-6 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto">

        {/* Giant FITPULSE text */}
        <motion.div
          className="text-center mb-12 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div
            className="text-[clamp(60px,12vw,180px)] font-bold leading-none tracking-tight select-none text-outline"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            FITPULSE
          </div>
        </motion.div>

        {/* Tagline + CTA */}
        <motion.div className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p className="text-white/40 text-lg mb-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Ready to grow your gym?
          </p>
          <MagneticButton variant="primary">
            Book a Demo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </motion.div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14 border-t border-white/[0.05] pt-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white/50 text-xs font-semibold tracking-[0.15em] uppercase mb-4"
                style={{ fontFamily: 'Satoshi, sans-serif' }}>
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#"
                      className="text-white/35 hover:text-white text-sm transition-colors duration-200 cursor-none"
                      style={{ fontFamily: 'Satoshi, sans-serif' }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/[0.05] pt-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <rect x="2" y="10" width="20" height="4" rx="2" />
                <rect x="0" y="7" width="5" height="10" rx="2" />
                <rect x="19" y="7" width="5" height="10" rx="2" />
              </svg>
            </div>
            <span className="text-white/60 text-sm font-medium" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              © 2025 Fitpulse. All rights reserved.
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((s) => (
              <a key={s} href="#"
                className="text-white/25 hover:text-white/70 text-xs transition-colors cursor-none"
                style={{ fontFamily: 'Satoshi, sans-serif' }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom purple glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-32 pointer-events-none opacity-[0.06]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(30px)' }} />
    </footer>
  )
}
