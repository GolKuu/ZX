'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group } from 'three';

type CharacterKind = 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';

const DEPTH_COLORS: Record<CharacterKind, string> = {
  glitch: '#4fe7ff',
  lucky: '#f2c56a',
  mim: '#c879ff',
  titan: '#ff9a58',
  vorgh: '#ff4d6b',
};

/**
 * A restrained hard-surface layer behind the atlas. It adds a readable rim,
 * armor geometry and character-specific silhouette cues while the atlas still
 * owns every authored pose. The group is mounted inside the animated body, so
 * it follows the existing attack, fall and impact presentation exactly.
 */
export function CharacterDepthFX({ kind }: { readonly kind: CharacterKind }) {
  const root = useRef<Group>(null);
  const color = DEPTH_COLORS[kind];

  useFrame(({ clock }) => {
    const group = root.current;
    if (group === null) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + kind.length) * 0.035;
    group.scale.set(pulse, 1 / pulse, 1);
    group.rotation.z = Math.sin(clock.elapsedTime * 0.9 + kind.length) * 0.012;
  });

  return (
    <group ref={root} position={[0, 0.02, -0.045]} renderOrder={-1}>
      <mesh position={[0, 0.15, 0]} rotation-z={Math.PI / 4}>
        <ringGeometry args={[0.56, 0.575, 8]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={color}
          depthWrite={false}
          opacity={0.22}
          transparent
          toneMapped={false}
        />
      </mesh>
      {kind === 'glitch' ? (
        <>
          <mesh position={[-0.72, 0.66, 0]} rotation-z={-0.34}>
            <boxGeometry args={[0.14, 0.62, 0.035]} />
            <DepthMaterial color={color} opacity={0.3} />
          </mesh>
          <mesh position={[0.72, 0.2, 0]} rotation-z={0.34}>
            <boxGeometry args={[0.11, 0.48, 0.035]} />
            <DepthMaterial color="#b96dff" opacity={0.24} />
          </mesh>
        </>
      ) : null}
      {kind === 'lucky' ? (
        <>
          <mesh position={[-0.66, 0.52, 0]} rotation-z={Math.PI / 4}>
            <octahedronGeometry args={[0.16, 0]} />
            <DepthMaterial color={color} opacity={0.34} />
          </mesh>
          <mesh position={[0.66, -0.3, 0]} rotation-z={Math.PI / 4}>
            <octahedronGeometry args={[0.12, 0]} />
            <DepthMaterial color="#fff0ae" opacity={0.28} />
          </mesh>
        </>
      ) : null}
      {kind === 'mim' ? (
        <>
          <mesh position={[-0.68, 0.42, 0]}>
            <icosahedronGeometry args={[0.16, 1]} />
            <DepthMaterial color={color} opacity={0.26} />
          </mesh>
          <mesh position={[0.66, 0.58, 0]} scale={[0.62, 1.5, 0.62]}>
            <sphereGeometry args={[0.12, 12, 8]} />
            <DepthMaterial color="#e4a5ff" opacity={0.24} />
          </mesh>
        </>
      ) : null}
      {kind === 'titan' ? (
        <>
          <mesh position={[-0.78, 0.5, 0]} rotation-z={-0.16}>
            <boxGeometry args={[0.3, 0.48, 0.06]} />
            <DepthMaterial color={color} opacity={0.34} />
          </mesh>
          <mesh position={[0.78, 0.5, 0]} rotation-z={0.16}>
            <boxGeometry args={[0.3, 0.48, 0.06]} />
            <DepthMaterial color="#ffd18a" opacity={0.27} />
          </mesh>
        </>
      ) : null}
      {kind === 'vorgh' ? (
        <>
          <mesh position={[-0.62, 0.74, 0]} rotation-z={-0.28}>
            <coneGeometry args={[0.13, 0.42, 5]} />
            <DepthMaterial color={color} opacity={0.34} />
          </mesh>
          <mesh position={[0.62, 0.74, 0]} rotation-z={0.28}>
            <coneGeometry args={[0.13, 0.42, 5]} />
            <DepthMaterial color="#ff9aa9" opacity={0.25} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

function DepthMaterial({ color, opacity }: { readonly color: string; readonly opacity: number }) {
  return (
    <meshStandardMaterial
      color={color}
      depthWrite={false}
      emissive={color}
      emissiveIntensity={0.22}
      metalness={0.72}
      opacity={opacity}
      roughness={0.32}
      transparent
    />
  );
}
