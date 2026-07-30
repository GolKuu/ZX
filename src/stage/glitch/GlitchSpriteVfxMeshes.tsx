import type { RefObject } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  Group,
} from 'three';

const TEAR_ROWS = [
  [-0.62, 0.34, 1.1],
  [0.54, 0.62, 0.72],
  [-0.42, 0.92, 1.35],
  [0.68, 1.2, 0.82],
  [-0.52, 1.46, 1.22],
  [0.46, 1.72, 0.68],
  [-0.34, 1.98, 0.94],
] as const;

const SHARDS = [
  [-0.25, 0.18, 0.06],
  [0.22, 0.2, -0.04],
  [-0.3, -0.16, -0.02],
  [0.27, -0.19, 0.05],
] as const;

export function GlitchImpactTears({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      {TEAR_ROWS.map(([x, y, width], index) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.13 + index * 0.002]}>
          <planeGeometry args={[width, 0.035 + (index % 3) * 0.018]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index % 3 === 0 ? '#ff2bd6' : '#16e6ff'}
            depthWrite={false}
            opacity={0.72}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

export function CorruptDataProjectile({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      <mesh rotation={[0.2, 0.4, 0.3]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#ff2a45" toneMapped={false} />
      </mesh>
      <mesh rotation={[-0.6, 0.2, -0.4]} scale={0.72}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#16e6ff"
          depthWrite={false}
          opacity={0.74}
          toneMapped={false}
          transparent
        />
      </mesh>
      <group position={[0, 0, 0.08]} rotation-z={Math.PI}>
        <mesh>
          <ringGeometry args={[0.25, 0.3, 3]} />
          <meshBasicMaterial color="#ff324e" side={DoubleSide} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.035, 0.01]} scale={[0.04, 0.14, 1]}>
          <boxGeometry />
          <meshBasicMaterial color="#fff4f5" toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.13, 0.01]} scale={0.045}>
          <boxGeometry />
          <meshBasicMaterial color="#fff4f5" toneMapped={false} />
        </mesh>
      </group>
      {SHARDS.map(([x, y, z], index) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={0.055 + index * 0.012}>
          <tetrahedronGeometry />
          <meshBasicMaterial
            color={index % 2 === 0 ? '#ff2bd6' : '#16e6ff'}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function LagSpikeField({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      {[0.72, 0.96, 1.18].map((scale, index) => (
        <mesh key={scale} position={[0, 0.12, -0.05]} rotation-x={Math.PI / 2} scale={scale}>
          <torusGeometry args={[0.78, 0.022 + index * 0.008, 4, 32]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index === 1 ? '#ff2bd6' : '#16e6ff'}
            depthWrite={false}
            opacity={0.54 - index * 0.08}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
      {[-0.5, -0.18, 0.16, 0.48].map((y, index) => (
        <mesh key={y} position={[index % 2 === 0 ? -0.32 : 0.28, 1.1 + y, 0.08]}>
          <planeGeometry args={[1.45 - index * 0.16, 0.045]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={index % 2 === 0 ? '#ffffff' : '#ff2bd6'}
            depthWrite={false}
            opacity={0.62}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
