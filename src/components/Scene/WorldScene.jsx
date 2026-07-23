import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import CameraRig from './CameraRig'
import GymEnvironment from './GymEnvironment'
import GymObjects from './GymObjects'
import Particles from './Particles'

export default function WorldScene() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 1.5, 11] }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        style={{ background: '#050505' }}
      >
        <fog attach="fog" args={['#050505', 12, 35]} />

        <Suspense fallback={null}>
          <Environment preset="warehouse" />

          <CameraRig>
            <GymEnvironment />
            <GymObjects />
            <Particles count={450} />
          </CameraRig>

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              intensity={1.8}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.25} darkness={0.8} />
          </EffectComposer>
        </Suspense>

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  )
}
