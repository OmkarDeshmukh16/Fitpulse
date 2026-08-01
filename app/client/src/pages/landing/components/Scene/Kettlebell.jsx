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
      {/* Heavy Cast Iron Bell Body */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.48, 36, 36]} />
        <meshPhysicalMaterial
          color="#161618"
          roughness={0.5}
          metalness={0.4}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Flat Bottom Rubber Base Pad */}
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
        <meshStandardMaterial color="#0d0d0f" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Smooth Ergonomic Chrome Handle */}
      <mesh position={[0, 0.68, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.24, 0.065, 16, 36]} />
        <meshPhysicalMaterial
          color="#e0e0e0"
          metalness={0.97}
          roughness={0.08}
          clearcoat={1.0}
        />
      </mesh>

      {/* Handle Horn Junctions */}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.12, 0.3, 20]} />
          <meshPhysicalMaterial color="#dcdcdc" metalness={0.95} roughness={0.12} />
        </mesh>
      ))}

      {/* Glowing Violet Accent Weight Stripe Ring */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.49, 0.02, 12, 48]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
