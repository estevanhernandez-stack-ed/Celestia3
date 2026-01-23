
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import ZodiacWheel from './ZodiacWheel';
import ConstellationField from './ConstellationField';
import { NatalChartData } from '../types';
import { ZODIAC_SIGNS, CONSTELLATION_RADIUS } from '../constants';

interface SceneProps {
  data: NatalChartData | null;
  selectedPlanet: string | null;
  onSelectPlanet: (name: string) => void;
  flybyActive: boolean;
}

const CameraRig: React.FC<{ targetPlanet: string | null; data: NatalChartData | null; flybyActive: boolean }> = ({ 
  targetPlanet, 
  data, 
  flybyActive 
}) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(100, 50, 100));
  const lookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    if (flybyActive && targetPlanet && data) {
      const planet = data.planets.find(p => p.name === targetPlanet);
      if (planet) {
        const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
        const totalDegrees = (signIndex * 30) + planet.degree;
        const rad = (totalDegrees * Math.PI) / 180;
        
        // Planet's position
        const px = Math.cos(rad) * planet.distance;
        const pz = Math.sin(rad) * planet.distance;
        
        // "Sun out" view: Camera is slightly closer to the center than the planet, looking outward.
        // We calculate a position along the same radial line but slightly inside the orbit.
        // If distance is 0 (Sun), we stay at a defaults.
        const inwardOffset = planet.distance > 5 ? planet.distance - 12 : -15;
        const camX = Math.cos(rad) * inwardOffset;
        const camZ = Math.sin(rad) * inwardOffset;
        const camY = 2; // Slight elevation

        targetPos.current.set(camX, camY, camZ);
        
        // Look through the planet at the background constellation
        const lookX = Math.cos(rad) * (planet.distance + 50);
        const lookZ = Math.sin(rad) * (planet.distance + 50);
        lookAtPos.current.set(lookX, 0, lookZ);
      }
    } else if (!flybyActive && !targetPlanet) {
      targetPos.current.set(100, 60, 100);
      lookAtPos.current.set(0, 0, 0);
    }

    camera.position.lerp(targetPos.current, 0.04);
    
    // Smoothly rotate the camera lookAt
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    const targetDirection = lookAtPos.current.clone().sub(camera.position).normalize();
    
    camera.lookAt(lookAtPos.current);
  });

  return null;
};

const CelestialScene: React.FC<SceneProps> = ({ data, selectedPlanet, onSelectPlanet, flybyActive }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[120, 80, 120]} fov={45} />
      <CameraRig targetPlanet={selectedPlanet} data={data} flybyActive={flybyActive} />
      
      {!flybyActive && <OrbitControls enablePan={true} maxDistance={400} minDistance={10} />}
      
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFCC33" />
      <spotLight position={[50, 100, 50]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      {/* Background stars */}
      <Stars radius={400} depth={50} count={8000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Stardust effect */}
      <Sparkles count={500} scale={CONSTELLATION_RADIUS * 1.5} size={2} speed={0.2} opacity={0.3} color="#ffffff" />
      <Sparkles count={200} scale={40} size={4} speed={0.5} opacity={0.6} color="#indigo" />

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
