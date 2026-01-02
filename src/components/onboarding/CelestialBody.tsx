import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Float, Ring, Line, Billboard, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { OnboardingPlanetData } from '@/types/onboarding';
import { ZODIAC_SIGNS, PLANET_CONFIGS } from './constants';

interface Props {
  data: OnboardingPlanetData;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

const CelestialBody: React.FC<Props> = ({ data, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const signIndex = ZODIAC_SIGNS.indexOf(data.sign);
  const totalDegrees = (signIndex * 30) + data.degree;
  const rad = (totalDegrees * Math.PI) / 180;
  
  const x = Math.cos(rad) * data.distance;
  const z = Math.sin(rad) * data.distance;
  const y = 0;

  const config = PLANET_CONFIGS[data.name] || { type: 'rocky', ring: false };
  const isStar = config.type === 'star';
  const isGas = config.type === 'gas';

  useFrame(() => {
    if (meshRef.current) {
      // Rotate planets
      meshRef.current.rotation.y += isStar ? 0.002 : 0.005;
    }
  });

  return (
    <group position={[x, y, z]}>
      <Float speed={isStar ? 1 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere
          ref={meshRef}
          args={[data.size, isStar ? 64 : 32, isStar ? 64 : 32]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.name);
          }}
        >
          {isStar ? (
            <MeshDistortMaterial
              color="#FDB813"
              emissive="#FF8C00"
              emissiveIntensity={1.2}
              roughness={0.1}
              metalness={0.1}
              speed={4} // Faster plasma movement
              distort={0.12} // Subtle surface ripples instead of blobby shape
              radius={1}
            />
          ) : (
            <meshStandardMaterial
              color={data.color}
              emissive={data.color}
              emissiveIntensity={isSelected ? 0.8 : 0.2}
              metalness={isGas ? 0.2 : 0.6}
              roughness={isGas ? 0.8 : 0.6}
            />
          )}
        </Sphere>
        
        {/* Star Corona: Multi-layer Glow */}
        {isStar && (
           <group>
             <Sphere args={[data.size * 1.1, 32, 32]}>
                <meshBasicMaterial 
                  color="#FFD700" 
                  transparent 
                  opacity={0.3} 
                  side={THREE.BackSide} 
                  blending={THREE.AdditiveBlending}
                 />
             </Sphere>
             <Sphere args={[data.size * 1.6, 32, 32]}>
                <meshBasicMaterial 
                  color="#FF4500" 
                  transparent 
                  opacity={0.15} 
                  side={THREE.BackSide} 
                  blending={THREE.AdditiveBlending}
                 />
             </Sphere>
           </group>
        )}

        {/* Atmosphere / Glow for Gas Giants & Selected Planets */}
        {(isGas || isSelected) && !isStar && (
           <Sphere args={[data.size * 1.2, 32, 32]}>
              <meshBasicMaterial 
                color={data.color} 
                transparent 
                opacity={isSelected ? 0.15 : 0.05} 
                side={THREE.BackSide} 
                blending={THREE.AdditiveBlending}
               />
           </Sphere>
        )}
      </Float>

      {/* Planetary Rings */}
      {config.ring && (
        <group rotation={[Math.PI / 2.5, 0, 0]}>
            <Ring args={[data.size * 1.4, data.size * 2.2, 64]}>
            <meshStandardMaterial color={data.color} side={THREE.DoubleSide} transparent opacity={0.6} />
            </Ring>
            {/* Inner detail ring */}
             <Ring args={[data.size * 1.5, data.size * 1.8, 64]} position={[0,0,0.01]}>
              <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.1} />
            </Ring>
        </group>
      )}
      
      {/* Star Particles */}
      {isStar && (
         <Sparkles count={50} scale={data.size * 3} size={4} speed={0.4} opacity={0.5} color="#FFFF00" />
      )}

      {/* Billboarded Label */}
      <Billboard position={[0, data.size + (isSelected ? 1.5 : 1), 0]}>
        <Text
          fontSize={isSelected ? 0.7 : 0.4}
          color={isSelected ? "#10b981" : "white"} // Emerald for selected
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000"
        >
          {data.name}
        </Text>
        {isSelected && (
           <Text
            position={[0, -0.4, 0]}
            fontSize={0.2}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
           >
            {data.sign.toUpperCase()}
           </Text>
        )}
      </Billboard>

      {/* Selection Line */}
      {isSelected && (
        <Line 
          points={[[0, 0, 0], [-x, -y, -z]]} 
          color={data.color} 
          lineWidth={2} 
          transparent 
          opacity={0.3} 
          dashed
          dashScale={2}
          gapSize={1}
        />
      )}
    </group>
  );
};

export default CelestialBody;
