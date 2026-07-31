import type { RefObject } from 'react';
import { AdditiveBlending, DoubleSide, Group } from 'three';

const SEGMENTS = [
  [-0.2, 1.78, 0.22, -0.12],
  [-0.43, 1.75, 0.24, -0.2],
  [-0.67, 1.69, 0.26, -0.29],
  [-0.92, 1.58, 0.28, -0.38],
  [-1.18, 1.43, 0.3, -0.5],
] as const;

/**
 * Persistent asymmetric energy cloth. It stays behind the torso and uses
 * narrow segments so attacks, anatomy and contact points remain readable.
 */
export function GlitchEnergyScarf({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} position={[0, 0, -0.08]}>
      {SEGMENTS.map(([x, y, width, rotation], index) => (
        <mesh
          key={x}
          position={[x, y, index * -0.003]}
          rotation-z={rotation}
        >
          <planeGeometry args={[width, 0.12 - index * 0.012]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index === 0 ? '#ffffff' : index % 2 === 0 ? '#25e8ff' : '#8d58ff'}
            depthWrite={false}
            opacity={0.78 - index * 0.08}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
