import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value, start, end) => clamp((value - start) / (end - start));
const smooth = (value) => value * value * (3 - 2 * value);

function Glove({ side = 1, gloveRef }) {
  return (
    <group ref={gloveRef} scale={0.92}>
      <mesh castShadow scale={[1.02, 1.18, 0.9]}>
        <sphereGeometry args={[1, 42, 42]} />
        <meshStandardMaterial color="#e63d24" roughness={0.3} metalness={0.08} />
      </mesh>

      <mesh castShadow position={[side * 0.67, -0.37, 0.16]} rotation={[0.15, 0, side * -0.35]} scale={[0.48, 0.7, 0.54]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#bd2819" roughness={0.36} />
      </mesh>

      <mesh castShadow position={[0, -1.08, 0]}>
        <cylinderGeometry args={[0.72, 0.88, 0.72, 32]} />
        <meshStandardMaterial color="#151515" roughness={0.48} />
      </mesh>

      <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.055, 12, 48]} />
        <meshStandardMaterial color="#5d89bd" emissive="#315578" emissiveIntensity={0.32} />
      </mesh>

      <mesh position={[0, -1.09, 0.72]}>
        <boxGeometry args={[0.66, 0.27, 0.04]} />
        <meshStandardMaterial color="#f3f0e8" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Belt({ beltRef, materialsRef }) {
  const bends = [-0.18, -0.1, -0.03, 0.04, 0.09, 0.12, 0.14];
  return (
    <group ref={beltRef} position={[0, -3.7, -1.8]} rotation={[-0.15, 0.25, -0.18]}>
      {bends.map((bend, index) => (
        <mesh key={index} position={[(index - 3) * 1.04, Math.sin((index - 3) * 0.55) * 0.32, 0]} rotation={[0, bend, bend * 0.5]}>
          <boxGeometry args={[1.1, 0.72, 0.13]} />
          <meshStandardMaterial
            ref={(material) => { if (material) materialsRef.current[index] = material; }}
            color="#3159d9"
            roughness={0.58}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      <mesh position={[3.78, 0.28, 0.02]} rotation={[0, 0.12, 0.08]}>
        <boxGeometry args={[1.35, 0.75, 0.15]} />
        <meshStandardMaterial
          ref={(material) => { if (material) materialsRef.current[7] = material; }}
          color="#080808"
          roughness={0.7}
          transparent
          opacity={0}
        />
      </mesh>
      {[3.48, 3.78, 4.08].map((x, index) => (
        <mesh key={x} position={[x, 0.28, 0.105]} rotation={[0, 0.12, 0.08]}>
          <boxGeometry args={[0.04, 0.68, 0.02]} />
          <meshStandardMaterial
            ref={(material) => { if (material) materialsRef.current[8 + index] = material; }}
            color="#f3f0e8"
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

function RingLines() {
  return (
    <group position={[0, 0, -3]} rotation={[0, 0, -0.08]}>
      {[3.1, 2, 0.9].map((size, index) => (
        <mesh key={size} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[size, 0.012, 4, 4]} />
          <meshBasicMaterial color={index === 0 ? '#5d89bd' : '#315578'} transparent opacity={index === 0 ? 0.34 : 0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function FightScene({ sectionRef }) {
  const sceneRef = useRef();
  const leftGlove = useRef();
  const rightGlove = useRef();
  const belt = useRef();
  const beltMaterials = useRef([]);
  const progressRef = useRef(0);

  useFrame((state, delta) => {
    if (!sectionRef.current || !leftGlove.current || !rightGlove.current || !belt.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const scrollable = Math.max(1, rect.height - window.innerHeight);
    const isMobile = window.innerWidth <= 600;
    const progress = clamp((-rect.top / scrollable) * (isMobile ? 1.28 : 1));
    progressRef.current = THREE.MathUtils.damp(progressRef.current, progress, 6, delta);
    const p = progressRef.current;

    const entrance = smooth(range(p, 0, isMobile ? 0.22 : 0.32));
    const impact = Math.sin(range(p, isMobile ? 0.2 : 0.3, isMobile ? 0.5 : 0.64) * Math.PI);
    const exit = smooth(range(p, isMobile ? 0.68 : 0.72, 1));
    const beltIn = smooth(range(p, isMobile ? 0.34 : 0.43, isMobile ? 0.6 : 0.7));

    leftGlove.current.position.set(
      THREE.MathUtils.lerp(-6.2, -1.28, entrance) - exit * 2.2,
      THREE.MathUtils.lerp(2.3, 0.35, entrance) + Math.sin(state.clock.elapsedTime * 0.7) * 0.055,
      impact * 1.1,
    );
    leftGlove.current.rotation.set(
      THREE.MathUtils.lerp(-0.5, 0.1, entrance),
      THREE.MathUtils.lerp(-0.75, 0.18, entrance),
      THREE.MathUtils.lerp(-0.85, -0.22, entrance),
    );

    rightGlove.current.position.set(
      THREE.MathUtils.lerp(6.2, 1.28, entrance) + exit * 2.2,
      THREE.MathUtils.lerp(-1.7, -0.05, entrance) - Math.sin(state.clock.elapsedTime * 0.7) * 0.055,
      impact * 1.52,
    );
    rightGlove.current.rotation.set(
      THREE.MathUtils.lerp(0.4, -0.06, entrance),
      THREE.MathUtils.lerp(0.75, -0.18, entrance),
      THREE.MathUtils.lerp(0.75, 0.22, entrance),
    );

    const gloveScale = 0.95 + impact * 0.13;
    leftGlove.current.scale.setScalar(gloveScale);
    rightGlove.current.scale.setScalar(gloveScale + impact * 0.04);

    belt.current.position.y = THREE.MathUtils.lerp(-3.8, -1.65, beltIn) + exit * 0.3;
    belt.current.position.z = THREE.MathUtils.lerp(-2.4, -0.75, beltIn);
    belt.current.rotation.z = -0.18 + beltIn * 0.09;
    beltMaterials.current.forEach((material) => {
      if (material) material.opacity = beltIn * (1 - exit * 0.72);
    });

    sceneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.035;
    sceneRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.18) * 0.018;
    sceneRef.current.scale.setScalar(isMobile ? 0.82 : 1);
  });

  return (
    <group ref={sceneRef}>
      <RingLines />
      <Glove side={1} gloveRef={leftGlove} />
      <Glove side={-1} gloveRef={rightGlove} />
      <Belt beltRef={belt} materialsRef={beltMaterials} />
    </group>
  );
}
