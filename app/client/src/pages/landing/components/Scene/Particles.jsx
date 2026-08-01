import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Particles({ count = 500 }) {
  const ref = useRef()
  const purpleRef = useRef()

  const { positions, purplePositions } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const purplePositions = new Float32Array(80 * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16
    }

    for (let i = 0; i < 80; i++) {
      purplePositions[i * 3] = (Math.random() - 0.5) * 12
      purplePositions[i * 3 + 1] = (Math.random() - 0.5) * 8
      purplePositions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }

    return { positions, purplePositions }
  }, [count])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 0.015
      ref.current.rotation.x = t * 0.008
    }
    if (purpleRef.current) {
      purpleRef.current.rotation.y = -t * 0.02
      purpleRef.current.rotation.z = t * 0.01
    }
  })

  return (
    <>
      {/* White dust particles */}
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#ffffff"
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Purple atmospheric particles */}
      <points ref={purpleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[purplePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#7C3AED"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}
