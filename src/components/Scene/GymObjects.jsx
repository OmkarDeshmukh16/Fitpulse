import Dumbbell from './Dumbbell'
import Kettlebell from './Kettlebell'
import ProteinShaker from './ProteinShaker'
import WeightPlate from './WeightPlate'
import OlympicBar from './OlympicBar'
import MedicineBall from './MedicineBall'

export default function GymObjects() {
  return (
    <group>
      {/* === CENTER HERO: Main Dumbbell === */}
      <Dumbbell position={[0, 0.5, 0]} floatOffset={0} />

      {/* === BACKGROUND: Olympic Bar (diagonal) === */}
      <group rotation={[0.1, 0.4, 0.15]}>
        <OlympicBar position={[1.5, -1.2, -3]} floatOffset={1.2} />
      </group>

      {/* === LEFT SIDE === */}
      <Kettlebell position={[-3.2, -0.4, -1]} floatOffset={0.8} />
      <ProteinShaker position={[-2.4, 0.8, 1.2]} floatOffset={2.1} />
      <MedicineBall position={[-4, 0.2, -2]} floatOffset={1.7} />

      {/* === RIGHT SIDE === */}
      <Kettlebell position={[3.4, -0.2, -0.8]} floatOffset={1.5} />
      <ProteinShaker position={[2.6, 1.1, 0.8]} floatOffset={0.4} />

      {/* === WEIGHT PLATES scattered === */}
      <WeightPlate position={[-1.8, -1, 1.5]} rotation={[0.3, 0.5, 0.2]} scale={0.85} floatOffset={0.5} speed={0.4} />
      <WeightPlate position={[2.2, -1.2, 1.8]} rotation={[-0.2, 0.8, 0.1]} scale={0.7} floatOffset={1.9} speed={0.35} />
      <WeightPlate position={[-3.5, 1.2, -2.5]} rotation={[0.5, 0.2, -0.3]} scale={0.6} floatOffset={3.1} speed={0.5} color="#2a2a2a" />
      <WeightPlate position={[3.8, 1.0, -1.5]} rotation={[-0.1, 1.2, 0.4]} scale={0.75} floatOffset={2.4} speed={0.45} color="#1e1e1e" />

      {/* === BACKGROUND LARGE PLATE (blurred depth) === */}
      <WeightPlate position={[0.5, -0.5, -4.5]} rotation={[0.2, 0.1, 0.3]} scale={1.4} floatOffset={4.0} speed={0.2} color="#0f0f0f" />
    </group>
  )
}
