import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Dumbbell({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + floatOffset) * 0.2
    groupRef.current.rotation.y += 0.005
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.08
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Chrome Handle Bar */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 1.7, 32]} />
        <meshPhysicalMaterial
          color="#dcdcdc"
          metalness={0.98}
          roughness={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Knurled Grip Bands on Handle */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.078, 0.008, 12, 32]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.9}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Heavy Steel Collars (Left & Right) */}
      {[-0.95, 0.95].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.16, 32]} />
          <meshPhysicalMaterial
            color="#e0e0e0"
            metalness={0.95}
            roughness={0.15}
            clearcoat={0.8}
          />
        </mesh>
      ))}

      {/* LEFT HEAVY WEIGHT PLATES CLUSTER */}
      <group position={[-1.18, 0, 0]}>
        {/* Outer Rubber Bumper Plate */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.14, 48]} />
          <meshPhysicalMaterial
            color="#141416"
            roughness={0.35}
            metalness={0.1}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {/* Raised Beveled Rim Ring */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.43, 0.025, 12, 48]} />
          <meshStandardMaterial color="#252528" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Secondary Inner Weight Plate */}
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 48]} />
          <meshPhysicalMaterial
            color="#1c1c20"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {/* Outer End Cap with Weight Numeral Text Ring */}
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
          <meshStandardMaterial color="#0d0d0f" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* RIGHT HEAVY WEIGHT PLATES CLUSTER */}
      <group position={[1.18, 0, 0]}>
        {/* Outer Rubber Bumper Plate */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.14, 48]} />
          <meshPhysicalMaterial
            color="#141416"
            roughness={0.35}
            metalness={0.1}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
          />
        </mesh>
        {/* Raised Beveled Rim Ring */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.43, 0.025, 12, 48]} />
          <meshStandardMaterial color="#252528" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Secondary Inner Weight Plate */}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 48]} />
          <meshPhysicalMaterial
            color="#1c1c20"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {/* Outer End Cap */}
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
          <meshStandardMaterial color="#0d0d0f" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* Glowing Purple Metallic Accent Rings */}
      {[-1.1, 1.1].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.44, 0.015, 12, 48]} />
          <meshStandardMaterial
            color="#7C3AED"
            emissive="#7C3AED"
            emissiveIntensity={1.2}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}
