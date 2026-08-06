import { Canvas } from '@react-three/fiber';
import FightScene from './FightScene.jsx';

export default function CombatExperience({ sectionRef }) {
  const isMobile = window.matchMedia('(max-width: 600px)').matches;

  return (
    <Canvas
      dpr={isMobile ? [1, 1.2] : [1, 1.5]}
      camera={{ position: [0, 0, isMobile ? 10.6 : 8.3], fov: isMobile ? 48 : 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 6, 7]} intensity={3.8} color="#ffffff" castShadow />
      <pointLight position={[-5, 1, 4]} intensity={22} color="#e63d24" distance={11} />
      <pointLight position={[5, -2, 3]} intensity={16} color="#5d89bd" distance={10} />
      <FightScene sectionRef={sectionRef} />
    </Canvas>
  );
}
