'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { readLatestHit } from '@/src/game/combatRuntime';

/**
 * Droplets thrown off the point of impact.
 *
 * Spawned in **world space** at the hitbox/hurtbox overlap the sim reports, not
 * parented to the fighter: blood does not travel with the body it left, and a burst
 * that slides along with the knockback reads as a decal rather than as spray. The
 * height of that overlap is also what tells the reaction which way to fold, so a
 * blow to the shin throws droplets off the shin and buckles the knee from the same
 * number.
 *
 * One `InstancedMesh` for the whole stage. The alternative — a mesh per droplet,
 * mounted and unmounted on every hit — puts React reconciliation on the frame a
 * combo lands, which is the frame that can least afford it.
 */

/** Droplets per hit, and the pool they are drawn from. */
const PER_BURST = 14;
const POOL = 56;

const GRAVITY = 7.4;
const FADE = 0.55;

/**
 * Bright, not realistic.
 *
 * A true arterial `#9c0b25` disappeared against this stage: the backdrop is deep
 * purple and maroon, so a dark red droplet is the same value as the wall behind it
 * and reads as a speck of dirt. The spray has to be the lightest thing in its own
 * neighbourhood to read as spray at all — the same reason `toneMapped` is off, so
 * the tone curve cannot pull it back down into the background.
 */
const BLOOD = '#f0344a';

interface Droplet {
  readonly position: Vector3;
  readonly velocity: Vector3;
  life: number;
  span: number;
  size: number;
}

function makeDroplet(): Droplet {
  return {
    position: new Vector3(),
    velocity: new Vector3(),
    life: 0,
    span: 1,
    size: 1,
  };
}

export function HitBlood() {
  const mesh = useRef<InstancedMesh>(null);
  const droplets = useRef<Droplet[]>(
    Array.from({ length: POOL }, () => makeDroplet()),
  );
  const nextSlot = useRef(0);
  const seenSerial = useRef<Record<string, number>>({ p1: 0, p2: 0 });
  const hasActiveDroplets = useRef(false);
  const initialized = useRef(false);
  const scratch = useRef({
    matrix: new Matrix4(),
    offset: new Vector3(),
    scale: new Vector3(),
    spin: new Quaternion(),
    axis: new Vector3(0, 0, 1),
  });

  useFrame((_state, delta) => {
    const instanced = mesh.current;
    if (instanced === null) return;

    let spawned = false;
    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seenSerial.current[fighterId]) continue;
      seenSerial.current[fighterId] = hit.serial;
      spawned = true;
      // Heavier blows throw more, and further. `damage` spans roughly 20…90.
      const power = Math.min(1.6, 0.5 + hit.damage / 70);
      for (let index = 0; index < PER_BURST; index += 1) {
        spawn(droplets.current, nextSlot, hit.x, hit.y, hit.away, power);
      }
    }

    if (!spawned && !hasActiveDroplets.current && initialized.current) return;

    const { matrix, offset, scale, spin, axis } = scratch.current;
    const step = Math.min(delta, 1 / 30);
    let active = false;
    for (let index = 0; index < POOL; index += 1) {
      const droplet = droplets.current[index];
      if (droplet === undefined) continue;
      if (droplet.life <= 0) {
        matrix.makeScale(0, 0, 0);
        instanced.setMatrixAt(index, matrix);
        continue;
      }
      droplet.life -= step;
      active = active || droplet.life > 0;
      droplet.velocity.y -= GRAVITY * step;
      droplet.position.addScaledVector(droplet.velocity, step);
      // Stop at the floor rather than falling through it, and die there.
      if (droplet.position.y <= 0.01) {
        droplet.position.y = 0.01;
        droplet.life = Math.min(droplet.life, FADE * 0.25);
      }

      const remaining = Math.max(0, droplet.life / droplet.span);
      // Stretched along travel: a round dot reads as a bubble, a streak as spray.
      const speed = droplet.velocity.length();
      const stretch = 1 + Math.min(2.2, speed * 0.5);
      const size = droplet.size * remaining;
      offset.copy(droplet.position);
      scale.set(size * stretch, size / Math.sqrt(stretch), size);
      spin.setFromAxisAngle(
        axis,
        Math.atan2(droplet.velocity.y, droplet.velocity.x),
      );
      matrix.compose(offset, spin, scale);
      instanced.setMatrixAt(index, matrix);
    }
    initialized.current = true;
    hasActiveDroplets.current = active;
    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      args={[undefined, undefined, POOL]}
      frustumCulled={false}
      name="hit-blood"
      ref={mesh}
    >
      {/* Seven segments: at this size a droplet is a handful of pixels, and any
          more is triangles nobody can see. */}
      <circleGeometry args={[0.042, 7]} />
      <meshBasicMaterial color={new Color(BLOOD)} toneMapped={false} />
    </instancedMesh>
  );
}

function spawn(
  droplets: readonly Droplet[],
  nextSlot: { current: number },
  x: number,
  y: number,
  away: number,
  power: number,
): void {
  const droplet = droplets[nextSlot.current % droplets.length];
  nextSlot.current = (nextSlot.current + 1) % droplets.length;
  if (droplet === undefined) return;

  // A cone thrown back along the blow, wide enough to look like a burst and not
  // like a nozzle.
  const spread = (Math.random() - 0.5) * 1.5;
  const speed = (1.4 + Math.random() * 2.8) * power;
  droplet.position.set(
    x + (Math.random() - 0.5) * 0.08,
    y + (Math.random() - 0.5) * 0.08,
    0.09 + Math.random() * 0.05,
  );
  droplet.velocity.set(
    away * speed * (0.45 + Math.random() * 0.55),
    speed * (0.25 + spread * 0.6),
    0,
  );
  droplet.span = FADE + Math.random() * 0.4;
  droplet.life = droplet.span;
  droplet.size = 0.55 + Math.random() * 0.75;
}
