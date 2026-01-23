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

const PLANET_COLORS: Record<string, { halo: string, emissive: string, shimmer: string }> = {
  "Sun": { halo: "#f59e0b", emissive: "#fbbf24", shimmer: "#fef3c7" },
  "Moon": { halo: "#94a3b8", emissive: "#cbd5e1", shimmer: "#f8fafc" },
  "Mercury": { halo: "#94a3b8", emissive: "#64748b", shimmer: "#e2e8f0" },
  "Venus": { halo: "#f472b6", emissive: "#fb923c", shimmer: "#fff7ed" },
  "Mars": { halo: "#ef4444", emissive: "#b91c1c", shimmer: "#fef2f2" },
  "Jupiter": { halo: "#fbbf24", emissive: "#d97706", shimmer: "#fffbeb" },
  "Saturn": { halo: "#d97706", emissive: "#92400e", shimmer: "#fef3c7" },
  "Uranus": { halo: "#22d3ee", emissive: "#0891b2", shimmer: "#ecfeff" },
  "Neptune": { halo: "#6366f1", emissive: "#4338ca", shimmer: "#eef2ff" },
  "Pluto": { halo: "#475569", emissive: "#1e293b", shimmer: "#f1f5f9" },
  "North Node": { halo: "#fb7185", emissive: "#e11d48", shimmer: "#fff1f2" },
  "Ascendant": { halo: "#c084fc", emissive: "#9333ea", shimmer: "#f5f3ff" }
};

const DEFAULT_COLORS = { halo: "#6366f1", emissive: "#4f46e5", shimmer: "#eef2ff" };

export const PlanetSceneOrb: React.FC<PlanetSceneOrbProps> = ({ name, x, y, size, isHovered = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const colors = PLANET_COLORS[name] || DEFAULT_COLORS;
  
  // Define which assets actually exist to avoid 404s
  const EXISTING_ASSETS = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northnode'
  ];

  // Normalize names for file paths
  const fileName = name.toLowerCase().replace(/\s+/g, '');
  const assetExists = EXISTING_ASSETS.includes(fileName);
  
  // Use "moon" as a generic fallback texture for points like Ascendant, 
  // or a transparent pixel if we had one. Tints will distinguish them.
  const texturePath = assetExists ? `/assets/planets/${fileName}.png` : `/assets/planets/moon.png`;
  
  // Load texture unconditionally to satisfy React Hook rules
  const texture = useLoader(THREE.TextureLoader, texturePath);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Calculate scaling based on hover
  const scale = isHovered ? 1.3 : 1;

  return (
    <group position={[x, y, 0]} scale={[size * scale, size * scale, size * scale]}>
      {/* Soft Ambient Glow / Halo */}
      <Sphere args={[1.2, 32, 32]}>
        <meshBasicMaterial 
          color={isHovered ? colors.shimmer : colors.halo} 
          transparent 
          opacity={isHovered ? 0.4 : 0.15}
          side={THREE.BackSide} 
        />
      </Sphere>

      {/* Main Planet Body */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={name === "Sun" ? null : texture} 
          emissiveMap={name === "Sun" ? texture : null} 
          color={name === "Sun" ? "#f59e0b" : (isHovered ? "#ffffff" : colors.shimmer)} // Use shimmer (light) color as base tint for transparency effect
          emissive={name === "Sun" ? "#fbbf24" : (isHovered ? colors.emissive : colors.halo)}
          emissiveIntensity={name === "Sun" ? (isHovered ? 4.0 : 2.5) : (isHovered ? 1.0 : 0.6)} // Increase base intensity
          roughness={name === "Sun" ? 0.1 : 0.4}
          metalness={name === "Sun" ? 0.9 : 0.3}
        />
      </Sphere>

      {/* Sun specific intense inner glow */}
      {name === "Sun" && (
        <Sphere args={[0.3, 16, 16]}>
            <meshBasicMaterial color="#ffffff" />
        </Sphere>
      )}

      {/* Atmospheric Shimmer on Hover */}
      {isHovered && (
        <Sphere args={[1.1, 32, 32]}>
          <MeshDistortMaterial
            color={colors.shimmer}
            transparent
            opacity={0.3}
            speed={3}
            distort={0.4}
            radius={1}
          />
        </Sphere>
      )}
      
      {/* Sun specific intense point light */}
      {name === "Sun" && (
        <pointLight color={colors.emissive} intensity={isHovered ? 2.5 : 1.5} distance={20} decay={2} />
      )}
    </group>
  );
};
