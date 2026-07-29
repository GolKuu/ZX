'use client';

import { useEffect, useMemo } from 'react';
import { Color, MeshToonMaterial } from 'three';
import { createCelGradient } from '@/src/render/celGradient';

const ringColor = new Color(0.25, 1.8, 3.2);

export function Arena() {
  const gradient = useMemo(() => createCelGradient(), []);
  const floorMaterial = useMemo(
    () => new MeshToonMaterial({
      color: '#101a2a',
      gradientMap: gradient,
    }),
    [gradient],
  );

  useEffect(() => () => {
    gradient.dispose();
    floorMaterial.dispose();
  }, [floorMaterial, gradient]);

  return (
    <group>
      <mesh material={floorMaterial} position={[0, -0.16, 0]}>
        <cylinderGeometry args={[4.85, 4.85, 0.22, 48]} />
      </mesh>
      <mesh position={[0, -0.035, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[4.58, 0.045, 8, 96]} />
        <meshBasicMaterial color={ringColor} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.025, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.2, 0.012, 6, 72]} />
        <meshBasicMaterial color="#23445a" toneMapped={false} />
      </mesh>
      <mesh position={[-1.45, -0.025, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.68, 24]} />
        <meshBasicMaterial color="#02040a" opacity={0.52} transparent depthWrite={false} />
      </mesh>
      <mesh position={[1.45, -0.025, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.68, 24]} />
        <meshBasicMaterial color="#02040a" opacity={0.52} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
