import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLenis } from './hooks/useLenis'

import LoadingScreen from './components/LoadingScreen'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import WorldScene from './components/Scene/WorldScene'

import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import DashboardSection from './sections/DashboardSection'
import StatsSection from './sections/StatsSection'
import TestimonialsSection from './sections/TestimonialsSection'
import PricingSection from './sections/PricingSection'
import CTASection from './sections/CTASection'
import Footer from './sections/Footer'

export default function App() {
  const [loading, setLoading] = useState(true)
  const lenisRef = useLenis()

  // Prevent scroll during loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [loading])

  return (
    <>
      {/* Premium custom cursor */}
      <CustomCursor />

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Loading screen */}
      <AnimatePresence>
        {loading && (
          <LoadingScreen onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {/* Main content — shown after loading */}
      {!loading && (
        <div className="relative" style={{ background: '#050505' }}>
          {/* Fixed 3D background scene */}
          <WorldScene />

          {/* Fixed navbar */}
          <Navbar />

          {/* Scrollable HTML overlay */}
          <div className="relative z-10">
            <HeroSection />

            {/* Dark overlay sections — glass sections on top of 3D */}
            <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,5,0.97) 8%, rgba(5,5,5,0.97) 100%)' }}>
              <FeaturesSection />
              <DashboardSection />
              <StatsSection />
              <TestimonialsSection />
              <PricingSection />
              <CTASection />
              <Footer />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
