import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useMousePosition } from '../../hooks/useMousePosition'

// Camera keyframes: scroll 0→1 drives camera through these positions
const KEYFRAMES = [
  { scroll: 0,    pos: [0, 1.5, 11],  target: [0, 0.5, 0] },   // Hero
  { scroll: 0.22, pos: [0, 0.8, 7.5], target: [0, 0, 0] },      // Zoom dumbbell
  { scroll: 0.42, pos: [-2, 0.5, 7],  target: [0, 0, -1] },     // Dashboard view
  { scroll: 0.60, pos: [2, 2, 9],     target: [0, 0.5, 0] },    // Stats pull back
  { scroll: 0.80, pos: [0, 3, 12],    target: [0, 0, 0] },      // Wide Pricing
  { scroll: 1.0,  pos: [0, 1.5, 11],  target: [0, 0.5, 0] },   // Return
]

function lerp(a, b, t) {
  return a + (b - a) * t
}

function getKeyframeAt(scroll) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const a = KEYFRAMES[i]
    const b = KEYFRAMES[i + 1]
    if (scroll >= a.scroll && scroll <= b.scroll) {
      const t = (scroll - a.scroll) / (b.scroll - a.scroll)
      const smooth = t * t * (3 - 2 * t) // smoothstep
      return {
        pos: [
          lerp(a.pos[0], b.pos[0], smooth),
          lerp(a.pos[1], b.pos[1], smooth),
          lerp(a.pos[2], b.pos[2], smooth),
        ],
        target: [
          lerp(a.target[0], b.target[0], smooth),
          lerp(a.target[1], b.target[1], smooth),
          lerp(a.target[2], b.target[2], smooth),
        ],
      }
    }
  }
  const last = KEYFRAMES[KEYFRAMES.length - 1]
  return { pos: last.pos, target: last.target }
}

export default function CameraRig({ children }) {
  const { camera } = useThree()
  const scrollProgress = useScrollProgress()
  const { normalized } = useMousePosition()
  const currentPos = useRef([0, 1.5, 11])
  const currentTarget = useRef([0, 0.5, 0])

  useFrame(() => {
    const { pos, target } = getKeyframeAt(scrollProgress.current)

    // Mouse parallax offset
    const mx = normalized.current.x * 0.4
    const my = normalized.current.y * 0.25

    // Lerp current toward target (smooth camera)
    currentPos.current[0] = lerp(currentPos.current[0], pos[0] + mx, 0.04)
    currentPos.current[1] = lerp(currentPos.current[1], pos[1] + my * 0.5, 0.04)
    currentPos.current[2] = lerp(currentPos.current[2], pos[2], 0.04)

    currentTarget.current[0] = lerp(currentTarget.current[0], target[0], 0.04)
    currentTarget.current[1] = lerp(currentTarget.current[1], target[1], 0.04)
    currentTarget.current[2] = lerp(currentTarget.current[2], target[2], 0.04)

    camera.position.set(...currentPos.current)
    camera.lookAt(...currentTarget.current)
  })

  return <group>{children}</group>
}
