
import React from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ZODIAC_SIGNS } from '../constants';

const ZodiacWheel: React.FC = () => {
  const radius = 110;

  return (
    <group>
      {/* Outer Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 2, radius, 128]} />
        <meshBasicMaterial color="#333" side={THREE.DoubleSide} />
      </mesh>

      {/* Sign Boundaries and Labels */}
      {/* Fix: Use central ZODIAC_SIGNS constant */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const nextAngle = ((i + 1) * 30 * Math.PI) / 180;
        const labelAngle = (angle + nextAngle) / 2;

        const lx = Math.cos(labelAngle) * (radius + 5);
        const lz = Math.sin(labelAngle) * (radius + 5);

        return (
          <group key={sign}>
            {/* Boundary line */}
            <Line
              points={[
                [Math.cos(angle) * (radius - 5), 0, Math.sin(angle) * (radius - 5)],
                [Math.cos(angle) * (radius + 10), 0, Math.sin(angle) * (radius + 10)]
              ]}
              color="#555"
              lineWidth={1}
            />
            
            {/* Sign Text */}
            <Text
              position={[lx, 0, lz]}
              rotation={[-Math.PI / 2, 0, -labelAngle + Math.PI / 2]}
              fontSize={3}
              color="#888"
            >
              {sign}
            </Text>
          </group>
        );
      })}

      {/* Ecliptic Grid Lines */}
      <gridHelper args={[radius * 2, 24, 0x222222, 0x111111]} position={[0, -1, 0]} />
    </group>
  );
};

export default ZodiacWheel;
