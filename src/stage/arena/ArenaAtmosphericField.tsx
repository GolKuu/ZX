'use client';

/* eslint-disable react-hooks/immutability -- The memoized Three.js particle pool is intentionally updated by useFrame, outside React rendering. */

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { FIXED_SCALE } from '@/src/sim';
import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';
import { useRenderStore } from '@/src/store/renderStore';

type FighterId = 'p1' | 'p2';

interface AtmosOrb {
  position: Vector3;
  velocity: Vector3;
  life: number;
  span: number;
  size: number;
  hue: number;
  active: boolean;
}

const ORB_COUNT = 24;
const BASE_LIFE = 1.15;

function makeOrbs(): AtmosOrb[] {
  return Array.from({ length: ORB_COUNT }, () => ({
    position: new Vector3(),
    velocity: new Vector3(),
    life: 0,
    span: BASE_LIFE,
    size: 0.16,
    hue: 0.56,
    active: false,
  }));
}

function emitAura(
  pool: AtmosOrb[],
  cursor: { current: number },
  x: number,
  y: number,
  spread: number,
  hue: number,
  life: number,
) {
  const orb = pool[cursor.current];
  cursor.current = (cursor.current + 1) % ORB_COUNT;
  if (orb === undefined) return;
  orb.active = true;
  orb.life = life;
  orb.span = life;
  orb.position.set(
    x + (Math.random() - 0.5) * spread,
    y,
    -0.2 + (Math.random() - 0.5) * 0.24,
  );
  orb.velocity.set(
    (Math.random() - 0.5) * 0.42,
    0.72 + Math.random() * 0.42,
    (Math.random() - 0.5) * 0.06,
  );
  orb.size = 0.12 + Math.random() * 0.1;
  orb.hue = hue + (Math.random() - 0.5) * 0.2;
}

export function ArenaAtmosphericField() {
  const group = useRef<Group>(null);
  const orbs = useMemo(() => makeOrbs(), []);
  const cursor = useRef(0);
  const seenHitSerial = useRef<Record<FighterId, number>>({ p1: 0, p2: 0 });
  const superVersion = useRenderStore(
    (state) =>
      state.mimSuperVersion
      + state.echoSuperVersion
      + state.chronoSuperVersion
      + state.glitchSuperVersion,
  );
  const impactVersion = useRenderStore((state) => state.impactVersion);
  const versionRef = useRef({ impact: 0, super: 0 });
  const ambientPower = useRef(0);

  useFrame(({ clock }, delta) => {
    const root = group.current;
    if (root === null) return;
    ambientPower.current = Math.max(0, ambientPower.current - delta * 1.2);

    if (impactVersion !== versionRef.current.impact) {
      versionRef.current.impact = impactVersion;
      ambientPower.current = 0.8 + Math.abs(Math.sin(clock.elapsedTime * 0.2)) * 0.28;
    }
    if (superVersion !== versionRef.current.super) {
      versionRef.current.super = superVersion;
      const p1 = readCombatFighter('p1');
      const p2 = readCombatFighter('p2');
      if (p1 !== null) emitAura(orbs, cursor, p1.position.x / FIXED_SCALE, p1.position.y / FIXED_SCALE + 1, 0.7, 0.72, 1.55);
      if (p2 !== null) emitAura(orbs, cursor, p2.position.x / FIXED_SCALE, p2.position.y / FIXED_SCALE + 1, 0.7, 0.72, 1.55);
    }

    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seenHitSerial.current[fighterId]) continue;
      seenHitSerial.current[fighterId] = hit.serial;
      emitAura(orbs, cursor, hit.x, hit.y + 0.12, 0.42, 0.52, BASE_LIFE);
      emitAura(orbs, cursor, hit.x + 0.22 * hit.away, hit.y + 0.18, 0.18, 0.66, BASE_LIFE * 0.82);
    }

    for (let index = 0; index < ORB_COUNT; index += 1) {
      const orb = orbs[index];
      const child = root.children[index] as (Mesh & { material: MeshBasicMaterial }) | undefined;
      if (orb === undefined || child === undefined) continue;
      if (!orb.active) {
        child.visible = false;
        child.scale.set(0, 0, 0);
        continue;
      }
      orb.life -= delta;
      if (orb.life <= 0) {
        orb.active = false;
        child.visible = false;
        child.scale.set(0, 0, 0);
        continue;
      }
      const remaining = orb.life / orb.span;
      orb.position.addScaledVector(orb.velocity, delta);
      orb.velocity.y -= 1.45 * delta;
      const pulse = 0.35 + ambientPower.current * 0.45;
      const alpha = Math.max(0, remaining * pulse);
      const breathe = 0.06 * Math.sin(clock.elapsedTime * 3.8 + index);
      const scale = Math.max(0.015, orb.size * (0.6 + remaining + breathe));
      child.visible = true;
      child.position.copy(orb.position);
      child.scale.set(scale * 2.4, scale, scale * 0.16);
      child.material.opacity = alpha * 0.8;
      child.material.color.setHSL(
        (orb.hue + remaining * 0.12) % 1,
        0.74,
        0.58,
      );
      child.material.opacity = Math.max(0.08, child.material.opacity);
    }
  });

  return (
    <group ref={group} position={[0, 0, -7.2]} renderOrder={-9}>
      {Array.from({ length: ORB_COUNT }).map((_, index) => (
        <mesh
          key={`atm-${index}`}
          visible={false}
        >
          <planeGeometry args={[0.24, 0.08]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color="#98d2ff"
            depthWrite={false}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
