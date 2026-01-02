
import React from 'react';
import { Line, Sphere, Billboard, Text } from '@react-three/drei';
import { ZODIAC_SIGNS, CONSTELLATION_DATA, CONSTELLATION_RADIUS } from './constants';

const Constellation: React.FC<{ sign: string; angle: number }> = ({ sign, angle }) => {
  const data = CONSTELLATION_DATA[sign];
  if (!data) return null;

  const radius = CONSTELLATION_RADIUS;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  // Create rotation to face the center
  const rotationY = -angle + Math.PI / 2;

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Label above constellation */}
      <Billboard position={[0, 15, 0]}>
        <Text
          fontSize={6}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.2}
          outlineColor="#000"
        >
          {sign.toUpperCase()}
        </Text>
      </Billboard>

      {/* Stars */}
      {data.stars.map((pos, i) => (
        <Sphere key={i} args={[0.3, 8, 8]} position={pos}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      ))}

      {/* Connection Lines */}
      {data.lines.map(([start, end], i) => (
        <Line
          key={i}
          points={[data.stars[start], data.stars[end]]}
          color="#ffffff"
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
};

const ConstellationField: React.FC = () => {
  return (
    <group>
      {ZODIAC_SIGNS.map((sign, i) => {
        // Position each constellation at the center of its 30-degree segment
        const angle = ((i * 30 + 15) * Math.PI) / 180;
        return <Constellation key={sign} sign={sign} angle={angle} />;
      })}
    </group>
  );
};

export default ConstellationField;
