
import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import ZodiacWheel from './ZodiacWheel';
import ConstellationField from './ConstellationField';
import { OnboardingChartData } from '@/types/onboarding';
import { ZODIAC_SIGNS, CONSTELLATION_RADIUS } from './constants';

interface SceneProps {
  data: OnboardingChartData | null;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string) => void;
  flybyActive: boolean;
  onReady?: () => void;
}

const CameraRig: React.FC<{ targetPlanet: string | null; data: OnboardingChartData | null; flybyActive: boolean }> = ({ 
  targetPlanet, 
  data, 
  flybyActive 
}) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(300, 150, 300)); // Start further back for dramatic entrance
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));
  const hasAcquiredTarget = useRef(false);

  useFrame((state) => {
    if (flybyActive && targetPlanet && data) {
      const planet = data.planets.find(p => p.name === targetPlanet);
      if (planet) {
        if (!hasAcquiredTarget.current) {
            hasAcquiredTarget.current = true;
            // Snappy snap to start the zoom from the current far position towards the planet
        }
        
        const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
        const totalDegrees = (signIndex * 30) + planet.degree;
        const rad = (totalDegrees * Math.PI) / 180;
        
        // "Sun out" view: Camera is slightly further back and elevated.
        const inwardOffset = planet.distance > 5 ? planet.distance - 25 : -25;
        const camX = Math.cos(rad) * inwardOffset;
        const camZ = Math.sin(rad) * inwardOffset;
        const camY = 8; 

        targetPos.current.set(camX, camY, camZ);
        
        const lookX = Math.cos(rad) * (planet.distance + 80);
        const lookZ = Math.sin(rad) * (planet.distance + 80);
        lookAtPos.current.set(lookX, -15, lookZ); 
      }
    } else if (!flybyActive && !targetPlanet) {
      hasAcquiredTarget.current = false;
      const time = state.clock.getElapsedTime();
      targetPos.current.set(
        150 + Math.sin(time * 0.1) * 30, 
        80 + Math.cos(time * 0.1) * 15, 
        150 + Math.sin(time * 0.05) * 30
      );
      lookAtPos.current.set(0, 0, 0);
    }

    // CINEMATIC SMOOTHING
    // Snappier if far away, smoother as we arrive
    const dist = camera.position.distanceTo(targetPos.current);
    const lerpSpeed = dist > 100 ? 0.08 : 0.03; 
    
    camera.position.lerp(targetPos.current, lerpSpeed);
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

const Nebula: React.FC = () => {
  return (
    <group>
      {/* Deep Purple Core */}
      <Sparkles count={50} scale={200} size={20} speed={0} opacity={0.08} color="#4b0082" />
      {/* Indigo Wash */}
      <Sparkles count={80} scale={300} size={40} speed={0} opacity={0.05} color="#1e1b4b" />
      {/* Distant Teal Glow */}
      <Sparkles count={40} scale={400} size={50} speed={0} opacity={0.02} color="#134e4a" />
    </group>
  );
};

const CelestialScene: React.FC<SceneProps> = ({ data, selectedPlanet, onSelectPlanet, flybyActive, onReady }) => {
  return (
    <Canvas 
      shadows 
      dpr={[1, 2]}
      onCreated={() => {
        // Short delay to ensure shaders are compiled and first frame is ready
        setTimeout(() => {
            if (onReady) onReady();
        }, 200);
      }}
    >
      <PerspectiveCamera makeDefault position={[120, 80, 120]} fov={45} />
      <CameraRig targetPlanet={selectedPlanet} data={data} flybyActive={flybyActive} />
      
      {!flybyActive && <OrbitControls enablePan={true} maxDistance={400} minDistance={10} />}
      
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} intensity={4.0} color="#FFD700" distance={200} decay={2} />
      <spotLight position={[50, 100, 50]} angle={0.3} penumbra={1} intensity={1.5} castShadow color="#10b981" />
      
      <color attach="background" args={['#000005']} />
      <fog attach="fog" args={['#000005', 30, 450]} />

      {/* Background stars - Static and calm */}
      <Stars radius={450} depth={100} count={10000} factor={4} saturation={0} speed={0} />
      
      {/* Nebula & Stardust - Static dust */}
      <Nebula />
      <Sparkles count={800} scale={CONSTELLATION_RADIUS * 2} size={2} speed={0} opacity={0.2} color="#a5f3fc" />

      <group>
        <ZodiacWheel />
        <ConstellationField />
        {data?.planets.map((planet) => (
          <CelestialBody 
            key={planet.name} 
            data={planet} 
            isSelected={selectedPlanet === planet.name}
            onSelect={onSelectPlanet}
          />
        ))}
      </group>

      <React.Suspense fallback={null}>
        <Environment preset="city" />
      </React.Suspense>
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={40} blur={4} far={10} color="#047857" />
    </Canvas>
  );
};

export default CelestialScene;
