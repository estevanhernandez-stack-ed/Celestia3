
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
}

const CameraRig: React.FC<{ targetPlanet: string | null; data: OnboardingChartData | null; flybyActive: boolean }> = ({ 
  targetPlanet, 
  data, 
  flybyActive 
}) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(100, 50, 100));
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_state) => {
    if (flybyActive && targetPlanet && data) {
      const planet = data.planets.find(p => p.name === targetPlanet);
      if (planet) {
        const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
        const totalDegrees = (signIndex * 30) + planet.degree;
        const rad = (totalDegrees * Math.PI) / 180;
        
        // "Sun out" view: Camera is slightly further back and elevated.
        const inwardOffset = planet.distance > 5 ? planet.distance - 25 : -25;
        const camX = Math.cos(rad) * inwardOffset;
        const camZ = Math.sin(rad) * inwardOffset;
        const camY = 8; // Elevate camera for a better angle above the UI

        targetPos.current.set(camX, camY, camZ);
        
        // Look through the planet at the background constellation
        // Centralize the planet by looking at it directly at Y=0
        const lookX = Math.cos(rad) * (planet.distance + 80);
        const lookZ = Math.sin(rad) * (planet.distance + 80);
        lookAtPos.current.set(lookX, -15, lookZ); // PUSH PLANET HIGHER to clear UI
      }
    } else if (!flybyActive && !targetPlanet) {
      targetPos.current.set(100, 60, 100);
      lookAtPos.current.set(0, 0, 0);
    }

    camera.position.lerp(targetPos.current, 0.04);
    
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

const Nebula: React.FC = () => {
  return (
    <group>
      {/* Deep Purple Core */}
      <Sparkles count={50} scale={200} size={20} speed={0.1} opacity={0.15} color="#4b0082" />
      {/* Indigo Wash */}
      <Sparkles count={80} scale={300} size={40} speed={0.05} opacity={0.1} color="#1e1b4b" />
      {/* Distant Teal Glow */}
      <Sparkles count={40} scale={400} size={50} speed={0.02} opacity={0.05} color="#134e4a" />
    </group>
  );
};

const CelestialScene: React.FC<SceneProps> = ({ data, selectedPlanet, onSelectPlanet, flybyActive }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[120, 80, 120]} fov={45} />
      <CameraRig targetPlanet={selectedPlanet} data={data} flybyActive={flybyActive} />
      
      {!flybyActive && <OrbitControls enablePan={true} maxDistance={400} minDistance={10} />}
      
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={5.0} color="#FFCC33" />
      <spotLight position={[50, 100, 50]} angle={0.25} penumbra={1} intensity={2} castShadow color="#10b981" />
      
      {/* Background stars */}
      <Stars radius={400} depth={50} count={10000} factor={4} saturation={0} fade speed={0.1} />
      
      {/* Nebula & Stardust */}
      <Nebula />
      <Sparkles count={1000} scale={CONSTELLATION_RADIUS * 1.8} size={2} speed={0.2} opacity={0.3} color="#ffffff" />

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

      <Environment preset="night" />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
    </Canvas>
  );
};

export default CelestialScene;
