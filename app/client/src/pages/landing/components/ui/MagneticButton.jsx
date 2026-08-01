import { useRef, useCallback } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function MagneticButton({
  children,
  variant = 'primary',
  size = 'lg',
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

  const sizeClasses = {
    sm: 'px-5 py-2.5 text-sm font-semibold gap-2',
    md: 'px-7 py-3.5 text-base font-semibold gap-2.5',
    lg: 'px-9 py-4 text-base md:text-lg font-bold gap-3',
    xl: 'px-11 py-5 text-lg md:text-xl font-bold gap-3.5',
  }

  const baseClass = `relative inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-300 ${sizeClasses[size] || sizeClasses.lg}`

  const styleObj = variant === 'primary'
    ? {
        background: 'linear-gradient(135deg, #7C3AED, #5B21B6, #4C1D95)',
        boxShadow: '0 8px 30px rgba(124,58,237,0.45), 0 0 0 1px rgba(167,139,250,0.3)',
        color: '#FFFFFF',
        fontFamily: 'Satoshi, sans-serif',
        letterSpacing: '0.02em',
      }
    : {
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(16px)',
        color: '#FFFFFF',
        fontFamily: 'Satoshi, sans-serif',
        letterSpacing: '0.02em',
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
        {/* Hover background pulse */}
        <motion.span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: variant === 'primary'
              ? 'linear-gradient(135deg, #8B5CF6, #6D28D9, #5B21B6)'
              : 'rgba(255,255,255,0.12)',
          }}
        />

        {/* Hover shimmer sweep */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-full"
          style={{ transition: 'opacity 0.3s' }}
        >
          <span
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
              animation: 'shimmer 1.5s ease infinite',
            }}
          />
        </span>

        <motion.span
          style={{ x: innerX, y: innerY }}
          className="relative z-10 flex items-center justify-center gap-2.5"
        >
          {children}
        </motion.span>
      </Tag>
    </motion.div>
  )
}
