import { useRef, useCallback } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function MagneticButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  href,
  ...props
}) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 150, damping: 15 })
  const y = useSpring(0, { stiffness: 150, damping: 15 })
  const innerX = useSpring(0, { stiffness: 200, damping: 18 })
  const innerY = useSpring(0, { stiffness: 200, damping: 18 })

  const onMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    x.set(dx * 0.35)
    y.set(dy * 0.35)
    innerX.set(dx * 0.12)
    innerY.set(dy * 0.12)
  }, [x, y, innerX, innerY])

  const onMouseLeave = useCallback(() => {
    x.set(0); y.set(0); innerX.set(0); innerY.set(0)
  }, [x, y, innerX, innerY])

  const baseClass = variant === 'primary'
    ? 'relative px-7 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden'
    : 'relative px-7 py-3.5 rounded-full text-sm font-semibold text-white overflow-hidden'

  const styleObj = variant === 'primary'
    ? {
        background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
        boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
        fontFamily: 'Satoshi, sans-serif',
      }
    : {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        fontFamily: 'Satoshi, sans-serif',
      }

  const Tag = href ? 'a' : 'button'

  return (
    <motion.div
      ref={ref}
      style={{ x, y, display: 'inline-block' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      <Tag
        className={`${baseClass} ${className} group cursor-none`}
        style={styleObj}
        onClick={onClick}
        href={href}
        {...props}
      >
        {/* Ripple glow on hover */}
        <motion.span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            background: variant === 'primary'
              ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 70%)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Hover shimmer sweep */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-full"
          style={{ transition: 'opacity 0.3s' }}
        >
          <span
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              animation: 'shimmer 1.5s ease infinite',
            }}
          />
        </span>

        <motion.span
          style={{ x: innerX, y: innerY }}
          className="relative z-10 flex items-center gap-2"
        >
          {children}
        </motion.span>
      </Tag>
    </motion.div>
  )
}
