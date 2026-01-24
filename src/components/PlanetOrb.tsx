import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

interface PlanetSceneOrbProps {
  name: string;
  x: number;
  y: number;
  size: number;
  isHovered?: boolean;
}

export const PlanetSceneOrb: React.FC<PlanetSceneOrbProps> = ({ name, x, y, size, isHovered = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Normalize names for file paths
  const fileName = name.toLowerCase().replace(/\s+/g, '');
  const texturePath = `/assets/planets/${fileName}.png`;
  
  // Load texture
  const texture = useLoader(THREE.TextureLoader, texturePath);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Calculate scaling based on hover
  const scale = isHovered ? 1.3 : 1;

  // Halo Color Mapping
  const getHaloColor = () => {
    if (name === 'Sun') return "#fcd34d"; // Golden Sun
    if (isHovered) return "#a5b4fc"; // Hovered highlight
    
    // Thematic defaults based on common planet colors
    const lowerName = name.toLowerCase();
    if (lowerName === 'moon') return "#f1f5f9";
    if (lowerName === 'mars') return "#f87171";
    if (lowerName === 'venus') return "#fbbf24";
    if (lowerName === 'mercury') return "#94a3b8";
    if (lowerName === 'jupiter') return "#d97706";
    
    return "#6366f1"; // Default Indigo
  };

  // Emissive / Glow Color Mapping
  const getEmissiveColor = () => {
    if (name === 'Sun') return "#fcd34d"; // Warm Gold
    if (isHovered) return "#a5b4fc"; // Default Hover Blue
    return "#000000";
  };

  const emissiveColor = getEmissiveColor();
  const haloColor = getHaloColor();

  return (
    <group position={[x, y, 0]} scale={[size * scale, size * scale, size * scale]}>
      {/* Soft Ambient Glow / Halo */}
      <Sphere args={[1.2, 32, 32]}>
        <meshBasicMaterial 
          color={haloColor} 
          transparent 
          opacity={isHovered ? 0.35 : 0.15}
          side={THREE.BackSide} 
        />
      </Sphere>

      {/* Main Planet Body */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={texture}
          emissive={emissiveColor}
          emissiveIntensity={isHovered ? 0.8 : 0.1}
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      {/* Atmospheric Shimmer on Hover */}
      {isHovered && (
        <Sphere args={[1.05, 32, 32]}>
          <MeshDistortMaterial
            color={emissiveColor}
            transparent
            opacity={0.3}
            speed={2}
            distort={0.4}
            radius={1}
          />
        </Sphere>
      )}
    </group>
  );
};
