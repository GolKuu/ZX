'use client';

import { AdditiveBlending } from 'three';

const VERTICAL_LINES = Array.from({ length: 25 }, (_, index) => -12 + index);
const HORIZON_LINES = [-0.2, -0.65, -1.2, -1.9, -2.8, -4, -5.5, -7.3, -9.5, -12];
const FLOOR_PIXELS = Array.from({ length: 52 }, (_, index) => ({
  x: -11.5 + ((index * 17) % 46) * 0.5,
  z: -0.4 - ((index * 29) % 48) * 0.25,
  size: index % 5 === 0 ? 0.16 : 0.1,
}));

export function RetroGridFloor() {
  return (
    <group position-y={-0.006}>
      <mesh position={[0, 0, -5.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[26, 15]} />
        <meshBasicMaterial color="#09091c" fog={false} />
      </mesh>

      {VERTICAL_LINES.map((x, index) => (
        <mesh
          key={x}
          position={[x, 0.012, -5.1]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[index % 4 === 0 ? 0.026 : 0.012, 15]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index % 4 === 0 ? '#23d7ff' : '#8b3cff'}
            depthWrite={false}
            opacity={index % 4 === 0 ? 0.7 : 0.38}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}

      {HORIZON_LINES.map((z, index) => (
        <mesh key={z} position={[0, 0.014, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[26, index % 3 === 0 ? 0.028 : 0.016]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index % 3 === 0 ? '#ff3eb5' : '#7a49ff'}
            depthWrite={false}
            opacity={0.52}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}

      {FLOOR_PIXELS.map((pixel, index) => (
        <mesh
          key={`${pixel.x}-${pixel.z}`}
          position={[pixel.x, 0.018, pixel.z]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[pixel.size, pixel.size]} />
          <meshBasicMaterial
            color={index % 3 === 0 ? '#ff3eb5' : '#23d7ff'}
            depthWrite={false}
            opacity={index % 4 === 0 ? 0.72 : 0.42}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}

      <mesh position={[0, 0.024, -12.8]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[28, 0.1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ff4fbf"
          depthWrite={false}
          opacity={0.9}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}
