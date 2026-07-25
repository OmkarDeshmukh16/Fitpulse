import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'

const footerLinks = {
  Product: ['Features', 'Dashboard', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Help Center', 'System Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Security', 'Cookie Settings'],
}

export default function Footer() {
  return (
    <footer
      id="footer"
      className="relative z-10 overflow-hidden border-t border-white/[0.06] flex flex-col items-center justify-center text-center w-full"
      style={{
        paddingTop: 'clamp(40px, 7vw, 120px)',
        paddingBottom: 'clamp(32px, 5vw, 80px)',
        paddingLeft: 'clamp(24px, 6vw, 100px)',
        paddingRight: 'clamp(24px, 6vw, 100px)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center text-center">

        {/* Giant FITPULSE Brand Headline */}
        <motion.div
          className="text-center mb-14 overflow-hidden w-full flex justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="text-[clamp(60px,13vw,190px)] font-extrabold leading-none tracking-tight select-none text-outline hover:tracking-wide transition-all duration-700 cursor-none"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            FITPULSE
          </div>
        </motion.div>

        {/* Tagline + Primary CTA Button */}
        <motion.div
          className="flex flex-col items-center justify-center text-center mb-24 w-full max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <p
            className="text-white/60 text-base sm:text-lg md:text-xl max-w-xl mx-auto text-center leading-relaxed font-normal mb-8"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            Ready to transform your gym operations and grow your business?
          </p>
          <MagneticButton variant="primary" size="xl">
            Book a Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </MagneticButton>
        </motion.div>

        {/* Navigation Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16 w-full text-center md:text-left mb-16 border-t border-white/[0.08] pt-16">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col items-center md:items-start">
              <h4
                className="text-white/50 text-xs font-semibold tracking-[0.2em] uppercase mb-6"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/45 hover:text-white text-sm font-medium transition-all duration-200 cursor-none inline-block hover:translate-x-1"
                      style={{ fontFamily: 'Satoshi, sans-serif' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar — Copyright & Social Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full border-t border-white/[0.08] pt-10 text-center md:text-left">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <rect x="2" y="10" width="20" height="4" rx="2" />
                <rect x="0" y="7" width="5" height="10" rx="2" />
                <rect x="19" y="7" width="5" height="10" rx="2" />
              </svg>
            </div>
            <span className="text-white/60 text-sm font-medium" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              © {new Date().getFullYear()} Fitpulse Inc. All rights reserved.
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {['Twitter / X', 'Instagram', 'LinkedIn', 'YouTube'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-white/35 hover:text-purple-400 text-xs font-semibold tracking-wider transition-colors duration-200 cursor-none"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Purple Glow Backdrop */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-44 pointer-events-none opacity-[0.08]"
        style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent 70%)', filter: 'blur(50px)' }}
      />
    </footer>
  )
}
