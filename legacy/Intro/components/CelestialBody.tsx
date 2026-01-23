
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Float, Ring, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from '../types';
import { ZODIAC_SIGNS } from '../constants';

interface Props {
  data: PlanetData;
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

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[x, y, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere
          ref={meshRef}
          args={[data.size, 32, 32]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.name);
          }}
        >
          <meshStandardMaterial
            color={data.color}
            emissive={data.color}
            emissiveIntensity={isSelected ? 1.5 : 0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
      </Float>

      {data.name === "Saturn" && (
        <Ring args={[data.size * 1.4, data.size * 2.2, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshStandardMaterial color={data.color} side={THREE.DoubleSide} transparent opacity={0.6} />
        </Ring>
      )}

      {/* Billboarded Label for better readability */}
      <Billboard position={[0, data.size + 1, 0]}>
        <Text
          fontSize={isSelected ? 0.6 : 0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {data.name}
        </Text>
      </Billboard>

      {isSelected && (
        <Line 
          points={[[0, 0, 0], [-x, -y, -z]]} 
          color={data.color} 
          lineWidth={1} 
          transparent 
          opacity={0.3} 
        />
      )}
    </group>
  );
};

export default CelestialBody;
