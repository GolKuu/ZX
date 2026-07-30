'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group } from 'three';

const SEGMENTS = Array.from({ length: 18 }, (_, index) => ({
  angle: (index / 18) * Math.PI * 2,
  bright: index % 5 === 0 || index % 7 === 0,
  scale: 0.72 + (index % 4) * 0.1,
}));

export function VoidRift() {
  const outerRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (outerRef.current !== null) {
      outerRef.current.rotation.z = clock.elapsedTime * 0.018;
    }
    if (innerRef.current !== null) {
      innerRef.current.rotation.z = -clock.elapsedTime * 0.025;
    }
  });

  return (
    <group position={[-5.8, 4.15, -14.8]} renderOrder={-7} scale={1.25}>
      <mesh>
        <ringGeometry args={[1.52, 2.12, 64]} />
        <meshBasicMaterial
          color="#0a1022"
          depthWrite={false}
          fog={false}
          opacity={0.94}
          transparent
        />
      </mesh>
      <mesh position-z={0.02}>
        <ringGeometry args={[1.72, 1.8, 64]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#7d3dff"
          depthWrite={false}
          fog={false}
          opacity={0.8}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh position-z={0.03}>
        <ringGeometry args={[1.4, 1.44, 64]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#bc63ff"
          depthWrite={false}
          fog={false}
          opacity={0.56}
          toneMapped={false}
          transparent
        />
      </mesh>

      <group ref={outerRef} position-z={0.04}>
        {SEGMENTS.map(({ angle, bright, scale }, index) => (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 2.02, Math.sin(angle) * 2.02, 0]}
            rotation-z={angle + Math.PI / 2}
            scale-x={scale}
          >
            <planeGeometry args={[0.72, 0.16]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={bright ? '#b46cff' : '#3a326e'}
              depthWrite={false}
              fog={false}
              opacity={index % 6 === 0 ? 0.34 : 0.82}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
      </group>

      <group ref={innerRef} position-z={0.05} scale={0.78}>
        {SEGMENTS.filter((_, index) => index % 2 === 0).map(({ angle }) => (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 2.02, Math.sin(angle) * 2.02, 0]}
            rotation-z={angle + Math.PI / 2}
          >
            <planeGeometry args={[0.38, 0.08]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color="#795bff"
              depthWrite={false}
              fog={false}
              opacity={0.64}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
