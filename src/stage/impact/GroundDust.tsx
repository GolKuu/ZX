'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  InstancedMesh,
  Matrix4,
  NormalBlending,
  Quaternion,
  Vector3,
} from 'three';
import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';
import { createSoftFalloffTexture } from '@/src/render/softFalloffTexture';
import { FIXED_SCALE } from '@/src/sim';

const POOL = 40;
/** Blows lighter than this shove a fighter without moving the floor. */
const DUST_DAMAGE = 34;

interface Mote {
  readonly position: Vector3;
  readonly velocity: Vector3;
  life: number;
  span: number;
  size: number;
}

function makeMote(): Mote {
  return {
    position: new Vector3(),
    velocity: new Vector3(),
    life: 0,
    span: 1,
    size: 0,
  };
}

/**
 * Dust thrown off the floor under a fighter who just took something heavy.
 *
 * Sparks say *metal met metal*; dust says *this happened on the ground, and the
 * ground felt it*. It is the difference between two figures trading hits in
 * front of a stage and two figures fighting on one. Deliberately dull and
 * short-lived — it is a texture at the bottom of frame, not an effect the eye is
 * meant to follow.
 */
export function GroundDust() {
  const mesh = useRef<InstancedMesh>(null);
  const motes = useRef(Array.from({ length: POOL }, makeMote));
  const cursor = useRef(0);
  const seen = useRef({ p1: 0, p2: 0 });
  const active = useRef(false);
  /**
   * Until the first frame writes them, every instance matrix is the identity —
   * forty unit quads stacked at the world origin, which is a tan card standing
   * in the middle of the arena. The pool has to be zeroed once before the early
   * return is allowed to skip the write.
   */
  const zeroed = useRef(false);
  const falloff = useMemo(() => createSoftFalloffTexture(), []);
  useEffect(() => () => falloff.dispose(), [falloff]);
  const scratch = useRef({
    matrix: new Matrix4(),
    scale: new Vector3(),
    rotation: new Quaternion(),
  });

  useFrame((_state, delta) => {
    const instances = mesh.current;
    if (instances === null) return;

    let spawned = false;
    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seen.current[fighterId]) continue;
      seen.current[fighterId] = hit.serial;
      if (hit.damage < DUST_DAMAGE) continue;
      const fighter = readCombatFighter(fighterId);
      // Airborne fighters have no floor under them to kick up.
      if (fighter === null || !fighter.grounded) continue;
      spawned = true;
      const weight = Math.min(1, hit.damage / 80);
      const count = Math.round(6 + weight * 9);
      const footX = fighter.position.x / FIXED_SCALE;
      for (let index = 0; index < count; index += 1) {
        spawn(motes.current, cursor, footX, hit.away, weight);
      }
    }

    if (!spawned && !active.current && zeroed.current) return;
    zeroed.current = true;

    const step = Math.min(delta, 1 / 30);
    const { matrix, scale, rotation } = scratch.current;
    let alive = false;
    for (let index = 0; index < motes.current.length; index += 1) {
      const mote = motes.current[index];
      if (mote === undefined || mote.life <= 0) {
        matrix.makeScale(0, 0, 0);
        instances.setMatrixAt(index, matrix);
        continue;
      }
      mote.life -= step;
      alive = alive || mote.life > 0;
      // Heavy drag and almost no gravity: dust hangs, it does not fall.
      mote.velocity.multiplyScalar(Math.exp(-3.2 * step));
      mote.velocity.y -= 0.5 * step;
      mote.position.addScaledVector(mote.velocity, step);
      const remaining = Math.max(0, mote.life / mote.span);
      // Puffs grow as they fade, the way a real cloud disperses.
      const size = mote.size * (1.6 - remaining * 0.6) * Math.min(1, remaining * 3);
      scale.set(size, size, size);
      matrix.compose(mote.position, rotation, scale);
      instances.setMatrixAt(index, matrix);
    }
    active.current = alive;
    instances.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, POOL]} frustumCulled={false} ref={mesh}>
      <planeGeometry args={[1, 1]} />
      {/* The falloff is not optional. Without an alpha ramp these instances are
          flat quads, and a dozen of them overlapping on the floor read as one
          grey card lying under the fighters rather than as a cloud. */}
      <meshBasicMaterial
        alphaMap={falloff}
        blending={NormalBlending}
        color="#8b7f74"
        depthWrite={false}
        opacity={0.22}
        transparent
      />
    </instancedMesh>
  );
}

function spawn(
  motes: readonly Mote[],
  cursor: { current: number },
  x: number,
  away: number,
  weight: number,
): void {
  const mote = motes[cursor.current % motes.length];
  cursor.current = (cursor.current + 1) % motes.length;
  if (mote === undefined) return;
  const spread = (Math.random() - 0.5) * 1.4;
  mote.position.set(x + spread * 0.5, 0.06 + Math.random() * 0.12, 0.3 + Math.random() * 0.2);
  mote.velocity.set(
    (spread + away * 0.6) * (1.1 + weight),
    0.5 + Math.random() * 1.1 * weight,
    0,
  );
  mote.span = 0.4 + Math.random() * 0.35;
  mote.life = mote.span;
  mote.size = 0.22 + Math.random() * 0.3 * (0.6 + weight);
}
