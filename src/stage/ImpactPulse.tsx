'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  type ColorRepresentation,
  Vector3,
} from 'three';
import { FIXED_SCALE } from '@/src/sim';
import {
  readCombatFighter,
  readLatestHit,
} from '@/src/game/combatRuntime';
import { useRenderStore } from '@/src/store/renderStore';

const RING_POOL = 24;
const BASE_RING_LIFE = 0.46;
const SUPER_RING_LIFE = 1.08;
const GROUND_Z = 0.06;

type FighterId = 'p1' | 'p2';

interface RingPulse {
  readonly mesh: Mesh;
  readonly material: MeshBasicMaterial;
  active: boolean;
  age: number;
  life: number;
  startRadius: number;
  endRadius: number;
  peak: number;
  rise: number;
  color: Color;
  z: number;
}

function createMaterial(color: ColorRepresentation): MeshBasicMaterial {
  const material = new MeshBasicMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
  material.color.set(color);
  return material;
}

export function ImpactPulse() {
  const geometry = useMemo(
    () => new RingGeometry(0.42, 0.56, 48, 3),
    [],
  );
  const ringColor = useMemo(() => new Color('#76d5ff'), []);
  const pool = useRef<Array<RingPulse>>(createPool(geometry, createMaterial));
  const nextRing = useRef(0);

  const seenHitSerial = useRef<Record<FighterId, number>>({ p1: 0, p2: 0 });
  const mimVersion = useRenderStore((state) => state.mimSuperVersion);
  const echoVersion = useRenderStore((state) => state.echoSuperVersion);
  const chronoVersion = useRenderStore((state) => state.chronoSuperVersion);
  const glitchVersion = useRenderStore((state) => state.glitchSuperVersion);
  const mimFighter = useRenderStore((state) => state.mimSuperFighterId);
  const echoFighter = useRenderStore((state) => state.echoSuperFighterId);
  const chronoFighter = useRenderStore((state) => state.chronoSuperFighterId);
  const glitchFighter = useRenderStore((state) => state.glitchSuperFighterId);
  const superVersions = useRef({
    mim: mimVersion,
    echo: echoVersion,
    chrono: chronoVersion,
    glitch: glitchVersion,
  });

  useEffect(() => () => {
    geometry.dispose();
    for (const pulse of pool.current) {
      pulse.material.dispose();
    }
  }, [geometry]);

  useFrame((_state, delta) => {
    for (const defender of ['p1', 'p2'] as const) {
      const hit = readLatestHit(defender);
      if (hit === null || hit.serial === seenHitSerial.current[defender]) {
        continue;
      }
      seenHitSerial.current[defender] = hit.serial;
      const power = clamp(0.6, Math.min(1.3, 0.42 + hit.damage / 70));
      const x = hit.x;
      emitBurst(pool.current, nextRing, x, 0.08, power, BASE_RING_LIFE);
      emitBurst(
        pool.current,
        nextRing,
        x - 0.22 * hit.away,
        0.08,
        power * 0.55,
        BASE_RING_LIFE * 1.14,
        0.16 + 0.26 * power,
      );
    }

    if (mimVersion !== superVersions.current.mim && mimFighter !== null) {
      superVersions.current.mim = mimVersion;
      launchSuperPulse(pool.current, nextRing, mimFighter, 1.12, 1.02, '#7f79ff', SUPER_RING_LIFE);
    }
    if (echoVersion !== superVersions.current.echo && echoFighter !== null) {
      superVersions.current.echo = echoVersion;
      launchSuperPulse(pool.current, nextRing, echoFighter, 1.2, 1.06, '#5de4ff', SUPER_RING_LIFE);
    }
    if (chronoVersion !== superVersions.current.chrono && chronoFighter !== null) {
      superVersions.current.chrono = chronoVersion;
      launchSuperPulse(pool.current, nextRing, chronoFighter, 1.34, 1.12, '#ffe37c', SUPER_RING_LIFE);
    }
    if (glitchVersion !== superVersions.current.glitch && glitchFighter !== null) {
      superVersions.current.glitch = glitchVersion;
      launchSuperPulse(pool.current, nextRing, glitchFighter, 1.28, 1.08, '#ff5de6', SUPER_RING_LIFE);
    }

    for (const pulse of pool.current) {
      if (!pulse.active) {
        pulse.mesh.visible = false;
        continue;
      }

      pulse.age += delta;
      if (pulse.age >= pulse.life) {
        pulse.active = false;
        pulse.mesh.visible = false;
        continue;
      }

      const linear = pulse.age / pulse.life;
      const eased = MathUtils.easeInOutCubic(MathUtils.clamp(linear, 0, 1));
      const radius = MathUtils.lerp(pulse.startRadius, pulse.endRadius, eased);
      const alpha = (1 - eased) * 0.9 * pulse.peak;
      const y = 0.01 + pulse.rise * (1 - eased);

      pulse.mesh.visible = alpha > 0.01;
      pulse.mesh.position.set(pulse.mesh.position.x, y, pulse.mesh.position.z);
      pulse.mesh.scale.set(radius, radius, 1);
      pulse.material.opacity = Math.max(0, alpha);
      pulse.mesh.position.z = pulse.z;
      pulse.material.color.copy(ringColor).lerp(pulse.color, 0.65);
      const stretch = 0.7 + pulse.age * 2.5;
      pulse.mesh.position.z = pulse.z + stretch;
    }
  });

  return (
    <>
      {pool.current.map((pulse, index) => (
        <primitive
          key={index}
          object={pulse.mesh}
        />
      ))}
    </>
  );
}

function launchSuperPulse(
  pool: Array<RingPulse>,
  nextRing: { current: number },
  fighterId: FighterId,
  start: number,
  peak: number,
  color: ColorRepresentation,
  life: number,
) {
  const fighter = readCombatFighter(fighterId);
  if (fighter === null) return;
  const position = fighter.position;
  emitBurst(
    pool,
    nextRing,
    position.x / FIXED_SCALE,
    0.02 + position.y / FIXED_SCALE,
    peak,
    life,
    start,
    color,
  );
}

function emitBurst(
  pool: Array<RingPulse>,
  nextRing: { current: number },
  x: number,
  y: number,
  peak: number,
  life: number,
  rise = 0.08,
  color: ColorRepresentation = '#6fd4ff',
) {
  const ring = pool[nextRing.current % pool.length];
  nextRing.current = (nextRing.current + 1) % pool.length;
  ring.active = true;
  ring.age = 0;
  ring.life = life;
  ring.startRadius = clamp(0.09, 0.2 + Math.random() * 0.08);
  ring.endRadius = clamp(1.2, 2.4 + (Math.random() * 1.4), 6);
  ring.peak = peak;
  ring.rise = rise;
  ring.color.set(color);
  ring.mesh.position.set(x, y, GROUND_Z);
  ring.z = 0.4 + Math.random() * 0.35;
  ring.mesh.visible = true;
  ring.material.opacity = 0;
}

function createPool(
  geometry: RingGeometry,
  createPulseMaterial: (color: ColorRepresentation) => MeshBasicMaterial,
): Array<RingPulse> {
  return Array.from({ length: RING_POOL }, () => {
    const material = createPulseMaterial('#6fd4ff');
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    mesh.frustumCulled = false;
    return {
      mesh,
      material,
      active: false,
      age: 0,
      life: 0,
      startRadius: 0.18,
      endRadius: 2.4,
      peak: 0.45,
      rise: 0.08,
      color: new Color(),
      z: 0.45,
    };
  });
}

function clamp(min: number, value: number, max = Infinity): number {
  return Math.max(min, Math.min(max, value));
}

