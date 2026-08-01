import { useEffect, useRef } from 'react'

export function useScrollProgress() {
  const progress = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      progress.current = docHeight > 0 ? scrollTop / docHeight : 0
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}
