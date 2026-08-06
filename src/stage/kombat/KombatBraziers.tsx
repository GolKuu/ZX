'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { PointLight } from 'three';
import { createFireMaterial } from './fireMaterial';
import type { KombatSurfaces } from './kombatMaterials';
import type { KombatTheme } from './kombatTheme';

/**
 * Braziers ringing the platform, behind the fighting plane.
 *
 * These are the stage's practicals: the light in the shot that the audience can
 * see the source of. Their real job is the flicker — a stage lit only by static
 * lamps looks like a render, and a fight lit by fire looks alive. Placed off the
 * disc so nothing ever burns in front of a fighter.
 */
const BRAZIERS = [
  { x: -8.5, z: -3.2 },
  { x: 8.5, z: -3.2 },
  { x: -12.4, z: -8.6 },
  { x: 12.4, z: -8.6 },
] as const;

export function KombatBraziers({
  surfaces,
  theme,
}: {
  readonly surfaces: KombatSurfaces;
  readonly theme: KombatTheme;
}) {
  return (
    <group>
      {BRAZIERS.map((brazier, index) => (
        <Brazier
          key={`${String(brazier.x)}:${String(brazier.z)}`}
          seed={index * 3.7}
          surfaces={surfaces}
          theme={theme}
          x={brazier.x}
          z={brazier.z}
        />
      ))}
    </group>
  );
}

function Brazier({
  seed,
  surfaces,
  theme,
  x,
  z,
}: {
  readonly seed: number;
  readonly surfaces: KombatSurfaces;
  readonly theme: KombatTheme;
  readonly x: number;
  readonly z: number;
}) {
  const light = useRef<PointLight>(null);
  const material = useMemo(
    () => createFireMaterial(theme.fire, theme.fireCore, seed),
    [seed, theme],
  );
  useEffect(() => () => material.dispose(), [material]);

  // Three.js uniforms are intentionally mutable render state; driving them from
  // the frame loop is the documented way to animate a shader.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    // eslint-disable-next-line react-hooks/immutability
    material.uniforms.uTime!.value = time;
    const lamp = light.current;
    if (lamp === null) return;
    // Two detuned sines beat against each other, so the flicker never settles
    // into a pulse the eye can predict.
    const flicker =
      Math.sin(time * 11.3 + seed) * 0.5 + Math.sin(time * 6.7 + seed * 2.1) * 0.5;
    lamp.intensity = 5.4 + flicker * 1.7;
  });

  return (
    <group position={[x, -1, z]}>
      <mesh castShadow material={surfaces.stone} position={[0, 0.6, 0]} receiveShadow>
        <cylinderGeometry args={[0.16, 0.3, 1.2, 10, 1]} />
      </mesh>
      <mesh castShadow material={surfaces.stone} position={[0, 1.34, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.36, 0.46, 14, 1]} />
      </mesh>
      <mesh material={material} position={[0, 2.3, 0.02]} renderOrder={4}>
        <planeGeometry args={[1.5, 2.4]} />
      </mesh>
      <pointLight
        ref={light}
        castShadow={false}
        color={theme.fire}
        decay={2}
        distance={17}
        intensity={5.4}
        position={[0, 1.9, 0.3]}
      />
    </group>
  );
}
