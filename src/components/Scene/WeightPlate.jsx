import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function WeightPlate({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '#1a1a1a', speed = 0.3, floatOffset = 0 }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * speed + floatOffset) * 0.15
    ref.current.rotation.x += 0.002
    ref.current.rotation.z += 0.001
  })

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Main ring */}
      <mesh castShadow>
        <torusGeometry args={[0.55, 0.18, 12, 32]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Center hole disc */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.38, 16]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Weight label ring */}
      <mesh>
        <torusGeometry args={[0.38, 0.04, 8, 32]} />
        <meshStandardMaterial color="#7C3AED" metalness={0.6} roughness={0.5} emissive="#7C3AED" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
