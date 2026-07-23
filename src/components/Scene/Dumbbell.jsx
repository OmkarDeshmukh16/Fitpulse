import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Dumbbell({ position = [0, 0, 0], floatOffset = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + floatOffset) * 0.2
    groupRef.current.rotation.y += 0.004
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.08
  })

  const metalProps = {
    metalness: 0.95,
    roughness: 0.15,
    color: '#888888',
    envMapIntensity: 1.5,
  }

  const darkMetal = {
    metalness: 0.9,
    roughness: 0.3,
    color: '#1c1c1c',
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Handle bar */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.6, 24]} />
        <meshStandardMaterial {...metalProps} color="#aaaaaa" />
      </mesh>

      {/* Knurling rings on handle */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.075, 0.012, 8, 20]} />
          <meshStandardMaterial {...darkMetal} />
        </mesh>
      ))}

      {/* Left collar */}
      <mesh position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 24]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>

      {/* Right collar */}
      <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 24]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>

      {/* Left plate group */}
      <group position={[-1.1, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 32]} />
          <meshStandardMaterial {...metalProps} color="#222222" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.06, 32]} />
          <meshStandardMaterial metalness={0.9} roughness={0.2} color="#333333" />
        </mesh>
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshStandardMaterial {...metalProps} color="#1a1a1a" />
        </mesh>
      </group>

      {/* Right plate group */}
      <group position={[1.1, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 32]} />
          <meshStandardMaterial {...metalProps} color="#222222" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.06, 32]} />
          <meshStandardMaterial metalness={0.9} roughness={0.2} color="#333333" />
        </mesh>
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshStandardMaterial {...metalProps} color="#1a1a1a" />
        </mesh>
      </group>

      {/* Purple accent emissive ring on each end */}
      {[-1.05, 1.05].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.025, 8, 32]} />
          <meshStandardMaterial
            color="#7C3AED"
            emissive="#7C3AED"
            emissiveIntensity={0.8}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
