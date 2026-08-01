import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function ProteinShaker({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + floatOffset) * 0.14
    groupRef.current.rotation.y += 0.005
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.05
  })

  return (
    <group ref={groupRef} position={position} scale={0.85}>
      {/* Frosted Transparent Shaker Plastic Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.2, 1.1, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.88}
          opacity={0.92}
          transparent
          roughness={0.12}
          ior={1.48}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          thickness={0.2}
        />
      </mesh>

      {/* Interior Protein Fluid Level */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.7, 32]} />
        <meshStandardMaterial
          color="#6D28D9"
          roughness={0.2}
          metalness={0.1}
          opacity={0.85}
          transparent
        />
      </mesh>

      {/* Floating Stainless Steel Wire Shaker Ball Coil */}
      <mesh position={[0, 0.2, 0]} rotation={[0.4, 0.2, 0.6]}>
        <torusGeometry args={[0.12, 0.02, 12, 32]} />
        <meshPhysicalMaterial
          color="#eeeeee"
          metalness={0.95}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* Screw Neck */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.18, 32]} />
        <meshStandardMaterial color="#333338" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Main Cap Ring (Violet accent) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.12, 32]} />
        <meshPhysicalMaterial
          color="#7C3AED"
          metalness={0.4}
          roughness={0.3}
          clearcoat={0.8}
        />
      </mesh>

      {/* Flip-Cap Lid Dome */}
      <mesh position={[0, 0.84, 0]}>
        <sphereGeometry args={[0.1, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#5B21B6" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Flip Cap Hinge / Carry Loop */}
      <mesh position={[0.12, 0.85, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.06, 0.015, 8, 20]} />
        <meshStandardMaterial color="#7C3AED" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Embossed Brand Logo Band */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.245, 0.22, 0.25, 32]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#5B21B6"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.6}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Volumetric Measurement Graduation Tick Lines (ml / oz) */}
      {[-0.35, -0.15, 0.05, 0.25].map((y, i) => (
        <mesh key={i} position={[0.235, y, 0]}>
          <boxGeometry args={[0.012, 0.018, 0.06]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}
