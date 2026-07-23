import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Kettlebell({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + floatOffset) * 0.18
    groupRef.current.rotation.y += 0.005
    groupRef.current.rotation.z = Math.sin(t * 0.4 + floatOffset) * 0.1
  })

  return (
    <group ref={groupRef} position={position} scale={0.85}>
      {/* Body - main sphere */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Flat bottom */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 24]} />
        <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.22, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Handle - torus */}
      <mesh position={[0, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.22, 0.06, 12, 24]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Purple weight indicator stripe */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.46, 0.025, 8, 32]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
