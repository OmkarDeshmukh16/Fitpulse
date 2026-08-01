import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomCursor() {
  const orbRef = useRef(null)
  const dotRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)
  const [clicks, setClicks] = useState([])
  const mouse = useRef({ x: 0, y: 0 })
  const orb = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    document.body.style.cursor = 'none'

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }

      // Check if hovering interactive element
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const isInteractive = el?.closest('a, button, [data-cursor-hover]')
      setIsHovering(!!isInteractive)
    }

    const lerp = (a, b, n) => a + (b - a) * n

    const animate = () => {
      orb.current.x = lerp(orb.current.x, mouse.current.x, 0.12)
      orb.current.y = lerp(orb.current.y, mouse.current.y, 0.12)
      if (orbRef.current) {
        const size = isHovering ? 56 : 40
        orbRef.current.style.transform = `translate(${orb.current.x - size / 2}px, ${orb.current.y - size / 2}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    const onClick = (e) => {
      const id = Date.now()
      setClicks(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== id))
      }, 700)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isHovering])

  return (
    <>
      {/* Lagging orb */}
      <div
        ref={orbRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full transition-all duration-200"
        style={{
          width: isHovering ? 56 : 40,
          height: isHovering ? 56 : 40,
          background: isHovering
            ? 'rgba(124, 58, 237, 0.25)'
            : 'rgba(124, 58, 237, 0.15)',
          backdropFilter: 'blur(4px)',
          boxShadow: isHovering
            ? '0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.2)'
            : '0 0 12px rgba(124, 58, 237, 0.3)',
          border: '1px solid rgba(124, 58, 237, 0.4)',
        }}
      />

      {/* Instant dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-white rounded-full pointer-events-none z-[9999]"
        style={{ boxShadow: '0 0 6px rgba(255,255,255,0.8)' }}
      />

      {/* Click particle bursts */}
      <AnimatePresence>
        {clicks.map(({ id, x, y }) => (
          <div key={id} className="fixed pointer-events-none z-[9997]" style={{ left: x, top: y }}>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const dist = 28 + Math.random() * 16
              return (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 2 === 0 ? '#7C3AED' : '#ffffff',
                    left: -3, top: -3,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              )
            })}
          </div>
        ))}
      </AnimatePresence>
    </>
  )
}
