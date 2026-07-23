import { useEffect, useRef } from 'react'

export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 })
  const normalized = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      position.current = { x: e.clientX, y: e.clientY }
      normalized.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return { position, normalized }
}
