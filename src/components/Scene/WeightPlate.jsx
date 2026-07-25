import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function WeightPlate({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#141416',
  speed = 0.3,
  floatOffset = 0,
}) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * speed + floatOffset) * 0.15
    ref.current.rotation.x += 0.002
    ref.current.rotation.z += 0.001
  })

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Heavy Bumper Rubber Body Ring */}
      <mesh castShadow>
        <torusGeometry args={[0.6, 0.2, 16, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Center Beveled Stainless Steel Hub Sleeve */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.42, 32]} />
        <meshPhysicalMaterial
          color="#dcdcdc"
          metalness={0.96}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* Inner Raised Ring Flange */}
      <mesh>
        <torusGeometry args={[0.35, 0.03, 12, 48]} />
        <meshStandardMaterial color="#222226" roughness={0.3} metalness={0.3} />
      </mesh>

      {/* Glowing Violet Accent Weight Label Ring */}
      <mesh>
        <torusGeometry args={[0.48, 0.02, 12, 48]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}
