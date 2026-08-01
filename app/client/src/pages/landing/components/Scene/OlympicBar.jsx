import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function OlympicBar({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.35 + floatOffset) * 0.12
    groupRef.current.rotation.z = Math.sin(t * 0.2 + floatOffset) * 0.05
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Main bar */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 3.6, 16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Sleeve ends */}
      {[-1.7, 1.7].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.25, 16]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Collar */}
          <mesh position={[i === 0 ? -0.14 : 0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.06, 16]} />
            <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Knurling center */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.032, 0.006, 6, 16]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
