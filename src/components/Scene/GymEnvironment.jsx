import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function GymEnvironment() {
  const floorRef = useRef()

  return (
    <>
      {/* === LIGHTING === */}

      {/* Very dark ambient */}
      <ambientLight intensity={0.06} color="#0a0a1a" />

      {/* Overhead key spotlight */}
      <spotLight
        position={[0, 10, 4]}
        angle={0.45}
        penumbra={0.8}
        intensity={3.5}
        color="#e8dcc8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        target-position={[0, 0, 0]}
      />

      {/* Purple bounce left rim */}
      <pointLight position={[-5, 3, 2]} intensity={4} color="#7C3AED" distance={14} decay={2} />

      {/* Purple rim right */}
      <pointLight position={[5, 2, 1]} intensity={2.5} color="#5B21B6" distance={12} decay={2} />

      {/* Warm backlight */}
      <directionalLight position={[4, 6, -6]} intensity={0.8} color="#c8a87a" />

      {/* Low ground bounce */}
      <pointLight position={[0, -1, 4]} intensity={1.2} color="#7C3AED" distance={8} decay={3} />

      {/* Additional front fill */}
      <pointLight position={[0, 4, 8]} intensity={1} color="#ffffff" distance={16} decay={2} />

      {/* === ENVIRONMENT GEOMETRY === */}

      {/* Concrete floor */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 40, 1, 1]} />
        <meshStandardMaterial
          color="#0d0d0d"
          metalness={0.05}
          roughness={0.95}
          envMapIntensity={0.1}
        />
      </mesh>

      {/* Floor grid lines - subtle */}
      <gridHelper
        args={[40, 30, '#1a1a2e', '#111128']}
        position={[0, -2.79, 0]}
      />

      {/* Back wall */}
      <mesh position={[0, 3, -9]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial
          color="#080808"
          metalness={0.0}
          roughness={1}
        />
      </mesh>

      {/* Side fog planes - atmospheric depth */}
      <mesh position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#050510"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[8, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#050510"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Purple floor glow disc */}
      <mesh position={[0, -2.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 32]} />
        <meshBasicMaterial
          color="#7C3AED"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
