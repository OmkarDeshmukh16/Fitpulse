import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function MedicineBall({ position = [0, 0, 0], floatOffset = 0 }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + floatOffset) * 0.1
    ref.current.rotation.y += 0.003
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.04
  })

  return (
    <group ref={ref} position={position} scale={0.7}>
      {/* Main sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.1} roughness={0.95} />
      </mesh>

      {/* Seam lines */}
      {[0, Math.PI / 2, Math.PI].map((rot, i) => (
        <mesh key={i} rotation={[rot, 0, 0]}>
          <torusGeometry args={[0.51, 0.012, 8, 64]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}

      {/* Weight text disc */}
      <mesh position={[0.35, 0.3, 0.3]}>
        <circleGeometry args={[0.12, 16]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
