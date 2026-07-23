import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function ProteinShaker({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + floatOffset) * 0.14
    groupRef.current.rotation.y += 0.004
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.05
  })

  return (
    <group ref={groupRef} position={position} scale={0.75}>
      {/* Main bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.19, 0.9, 24]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.1} roughness={0.6} transparent opacity={0.9} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 0.2, 20]} />
        <meshStandardMaterial color="#dddddd" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 20]} />
        <meshStandardMaterial color="#7C3AED" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Cap top */}
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#6D28D9" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Logo stripe */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.225, 0.195, 0.3, 24]} />
        <meshStandardMaterial color="#7C3AED" metalness={0.2} roughness={0.7} transparent opacity={0.6} />
      </mesh>

      {/* Graduation marks */}
      {[-0.25, 0, 0.25].map((y, i) => (
        <mesh key={i} position={[0.215, y, 0]}>
          <boxGeometry args={[0.01, 0.02, 0.05]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}
    </group>
  )
}
