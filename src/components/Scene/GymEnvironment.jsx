import { useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function GymEnvironment() {
  const floorRef = useRef()

  // Load wall background & bodybuilder poster textures
  const [wallTexture, posterTexture] = useTexture([
    '/assets/dark_gym_wall.png',
    '/assets/bodybuilder_poster.png',
  ])

  wallTexture.wrapS = THREE.RepeatWrapping
  wallTexture.wrapT = THREE.RepeatWrapping
  wallTexture.repeat.set(4, 2)

  return (
    <>
      {/* === LIGHTING === */}

      {/* Atmospheric ambient */}
      <ambientLight intensity={0.12} color="#0c0c1e" />

      {/* Main overhead gym spotlight */}
      <spotLight
        position={[0, 12, 6]}
        angle={0.5}
        penumbra={0.7}
        intensity={4.5}
        color="#fff4e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
      />

      {/* Poster spotlight */}
      <spotLight
        position={[0, 5, -3]}
        target-position={[0, 2, -8.8]}
        angle={0.6}
        penumbra={0.5}
        intensity={3.8}
        color="#7C3AED"
      />

      {/* Electric purple rim lights */}
      <pointLight position={[-6, 3, 2]} intensity={5} color="#7C3AED" distance={16} decay={2} />
      <pointLight position={[6, 2, 1]} intensity={4} color="#5B21B6" distance={14} decay={2} />

      {/* Warm side fill */}
      <directionalLight position={[5, 8, -4]} intensity={1.2} color="#d4af37" />

      {/* Floor glow highlight */}
      <pointLight position={[0, -1.5, 3]} intensity={2} color="#7C3AED" distance={10} decay={2} />

      {/* === ENVIRONMENT GEOMETRY === */}

      {/* Industrial Rubber Floor */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[45, 45, 1, 1]} />
        <meshStandardMaterial
          color="#0b0b0d"
          metalness={0.2}
          roughness={0.7}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Rubber floor tile seams / grid */}
      <gridHelper
        args={[45, 36, '#2a2a38', '#141420']}
        position={[0, -2.79, 0]}
      />

      {/* REALISTIC BACK WALL (Concrete/Brick Textured) */}
      <mesh position={[0, 3, -9]} receiveShadow>
        <planeGeometry args={[45, 18]} />
        <meshStandardMaterial
          map={wallTexture}
          color="#1a1a1a"
          metalness={0.1}
          roughness={0.85}
        />
      </mesh>

      {/* BODYBUILDER GYM POSTER / WALL ART DISPLAY */}
      <group position={[0, 2.8, -8.8]}>
        {/* Frame Outer Bezel */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7.4, 9.4, 0.15]} />
          <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Poster Canvas */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[7.0, 9.0]} />
          <meshStandardMaterial
            map={posterTexture}
            roughness={0.3}
            metalness={0.1}
            envMapIntensity={0.8}
          />
        </mesh>

        {/* Poster Neon Glowing Border Ring */}
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[7.15, 9.15]} />
          <meshBasicMaterial
            color="#7C3AED"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* OVERHEAD INDUSTRIAL STEEL BEAMS & NEON STRIPS */}
      {[-4, 0, 4].map((x, i) => (
        <group key={i} position={[x, 7.5, -2]}>
          {/* Steel Beam */}
          <mesh>
            <boxGeometry args={[0.3, 0.4, 16]} />
            <meshStandardMaterial color="#1f1f24" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Overhead Neon Light Strip */}
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.08, 0.04, 14]} />
            <meshStandardMaterial
              color="#7C3AED"
              emissive="#7C3AED"
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>
      ))}

      {/* Purple floor reflection disc */}
      <mesh position={[0, -2.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 32]} />
        <meshBasicMaterial
          color="#7C3AED"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
