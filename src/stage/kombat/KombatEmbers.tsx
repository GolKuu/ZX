'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  AdditiveBlending,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import type { KombatTheme } from './kombatTheme';

const COUNT = 90;
const SPAN_X = 34;
const SPAN_Z = 26;
const CEILING = 11;

interface Ember {
  readonly origin: Vector3;
  readonly rise: number;
  readonly sway: number;
  readonly phase: number;
  readonly size: number;
}

/**
 * The scatter, built once at module load from a fixed seed.
 *
 * Seeded rather than random, and outside the component rather than in a memo:
 * the swarm must be identical on every render and every machine, or a
 * re-render reshuffles it mid-fight and no two capture runs can be compared.
 */
const EMBERS: readonly Ember[] = (() => {
  let seed = 0x9e3779b9;
  const next = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  return Array.from({ length: COUNT }, () => ({
    origin: new Vector3(
      (next() - 0.5) * SPAN_X,
      next() * CEILING - 1,
      -1.6 - next() * SPAN_Z,
    ),
    rise: 0.35 + next() * 1.15,
    sway: 0.25 + next() * 0.8,
    phase: next() * Math.PI * 2,
    size: 0.018 + next() * 0.05,
  }));
})();

/**
 * Sparks lifting off the braziers and drifting through the room.
 *
 * Air is invisible until something is suspended in it. Ninety additive motes
 * moving at different speeds is enough to read the space between the camera and
 * the back wall as *volume* rather than empty distance — and because they are
 * instanced they cost one draw call. Spawned behind the fighting plane so they
 * never speckle a fighter's face.
 */
export function KombatEmbers({ theme }: { readonly theme: KombatTheme }) {
  const mesh = useRef<InstancedMesh>(null);
  const scratch = useRef({
    matrix: new Matrix4(),
    position: new Vector3(),
    scale: new Vector3(),
    rotation: new Quaternion(),
  });

  const embers = EMBERS;

  useFrame(({ clock }) => {
    const instances = mesh.current;
    if (instances === null) return;
    const time = clock.elapsedTime;
    const { matrix, position, scale, rotation } = scratch.current;

    for (let index = 0; index < embers.length; index += 1) {
      const ember = embers[index];
      if (ember === undefined) continue;
      // Wrap through the ceiling rather than respawning: no pop, no bookkeeping.
      const height = ((ember.origin.y + 1 + time * ember.rise) % (CEILING + 2)) - 1;
      position.set(
        ember.origin.x + Math.sin(time * ember.sway + ember.phase) * 0.7,
        height,
        ember.origin.z + Math.cos(time * ember.sway * 0.7 + ember.phase) * 0.5,
      );
      // Fade in from the floor and out at the top by shrinking, so the wrap is
      // invisible without needing per-instance opacity.
      const life = Math.min(1, height / 2.4) * (1 - Math.max(0, (height - 7) / 4));
      const size = ember.size * Math.max(0, life) * (0.8 + Math.sin(time * 9 + ember.phase) * 0.2);
      scale.set(size, size, size);
      matrix.compose(position, rotation, scale);
      instances.setMatrixAt(index, matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, COUNT]} frustumCulled={false} ref={mesh}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color={theme.ember}
        depthWrite={false}
        fog={false}
        toneMapped={false}
        transparent
      />
    </instancedMesh>
  );
}
