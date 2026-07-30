'use client';

/* eslint-disable react-hooks/immutability, react-hooks/refs -- Three.js objects are an imperative, non-rendering object pool updated by useFrame. */

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
} from 'three';
import { FIXED_SCALE } from '@/src/sim';
import {
  readCombatFighter,
  readLatestHit,
} from '@/src/game/combatRuntime';
import { useRenderStore } from '@/src/store/renderStore';

const RING_POOL = 46;
const SUPER_RING_LIFE = 1.12;
const GROUND_Z = 0.06;
const MIN_RISE = 0.08;
const MAX_RISE = 0.44;

type FighterId = 'p1' | 'p2';
type FighterFamily = 'mim' | 'echo' | 'chrono' | 'glitch' | 'unknown';

const HEAVY_HIT_THRESHOLD = 58;
const LEGENDARY_HIT_THRESHOLD = 82;
const SUPER_BURST_COUNT = 5;
const LANE_SPREAD = 0.09;
const LANE_SCALE = 0.09;
const LEGENDARY_LANE_SCALE = 0.12;

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
  baseY: number;
  baseX: number;
  depth: number;
  spinRate: number;
  drift: number;
  xOffset: number;
  xScale: number;
  yScale: number;
}

interface ImpactProfile {
  readonly color: ColorRepresentation;
  readonly altColor: ColorRepresentation;
  readonly peak: number;
  readonly life: number;
  readonly rise: number;
  readonly startRadius: [number, number];
  readonly endRadius: [number, number];
  readonly drift: [number, number];
  readonly ringCount: [number, number];
  readonly scale: [number, number];
}

interface FamilyProfile {
  readonly light: ImpactProfile;
  readonly heavy: ImpactProfile;
  readonly super: ImpactProfile;
}

const FIGHTER_IMPACT_STYLES: Record<FighterFamily, FamilyProfile> = {
  mim: {
    light: {
      color: '#79f4ff',
      altColor: '#c6ffff',
      peak: 1.08,
      life: 0.46,
      rise: 0.12,
      startRadius: [0.18, 0.26],
      endRadius: [2.2, 3.2],
      drift: [0.05, 0.18],
      ringCount: [1, 2],
      scale: [0.9, 1.14],
    },
    heavy: {
      color: '#6be8ff',
      altColor: '#9cf4ff',
      peak: 1.34,
      life: 0.72,
      rise: 0.19,
      startRadius: [0.19, 0.3],
      endRadius: [2.45, 3.6],
      drift: [0.09, 0.28],
      ringCount: [2, 3],
      scale: [1.02, 1.22],
    },
    super: {
      color: '#6dd1ff',
      altColor: '#d7f6ff',
      peak: 1.28,
      life: SUPER_RING_LIFE,
      rise: 0.26,
      startRadius: [0.22, 0.34],
      endRadius: [2.9, 4.2],
      drift: [0.16, 0.33],
      ringCount: [4, 5],
      scale: [1.05, 1.35],
    },
  },
  echo: {
    light: {
      color: '#58c7ff',
      altColor: '#c8f7ff',
      peak: 1.1,
      life: 0.45,
      rise: 0.11,
      startRadius: [0.2, 0.28],
      endRadius: [2.1, 3.1],
      drift: [0.04, 0.15],
      ringCount: [1, 2],
      scale: [1.06, 0.96],
    },
    heavy: {
      color: '#47d7ff',
      altColor: '#9fffff',
      peak: 1.34,
      life: 0.74,
      rise: 0.2,
      startRadius: [0.19, 0.28],
      endRadius: [2.3, 3.8],
      drift: [0.1, 0.24],
      ringCount: [2, 3],
      scale: [1.12, 1],
    },
    super: {
      color: '#48d7ff',
      altColor: '#deffff',
      peak: 1.32,
      life: SUPER_RING_LIFE + 0.02,
      rise: 0.28,
      startRadius: [0.24, 0.35],
      endRadius: [2.95, 4.45],
      drift: [0.18, 0.36],
      ringCount: [4, 6],
      scale: [1.16, 1.06],
    },
  },
  chrono: {
    light: {
      color: '#ffd45d',
      altColor: '#fff7c8',
      peak: 1.12,
      life: 0.49,
      rise: 0.11,
      startRadius: [0.17, 0.24],
      endRadius: [2.05, 3.24],
      drift: [0.04, 0.16],
      ringCount: [1, 2],
      scale: [0.94, 1.08],
    },
    heavy: {
      color: '#ffd25a',
      altColor: '#ffeb9d',
      peak: 1.38,
      life: 0.77,
      rise: 0.2,
      startRadius: [0.2, 0.32],
      endRadius: [2.4, 3.66],
      drift: [0.11, 0.25],
      ringCount: [2, 3],
      scale: [1.0, 1.2],
    },
    super: {
      color: '#ffdb65',
      altColor: '#fff4bc',
      peak: 1.42,
      life: SUPER_RING_LIFE + 0.04,
      rise: 0.3,
      startRadius: [0.25, 0.36],
      endRadius: [3, 4.6],
      drift: [0.2, 0.4],
      ringCount: [4, 6],
      scale: [1.09, 1.32],
    },
  },
  glitch: {
    light: {
      color: '#ff5ddf',
      altColor: '#ffccff',
      peak: 1.04,
      life: 0.46,
      rise: 0.1,
      startRadius: [0.21, 0.27],
      endRadius: [2.2, 3.15],
      drift: [0.04, 0.16],
      ringCount: [1, 2],
      scale: [0.95, 1.04],
    },
    heavy: {
      color: '#ff5de3',
      altColor: '#ffc4ff',
      peak: 1.35,
      life: 0.71,
      rise: 0.18,
      startRadius: [0.2, 0.32],
      endRadius: [2.4, 3.54],
      drift: [0.09, 0.22],
      ringCount: [2, 3],
      scale: [1.02, 1.2],
    },
    super: {
      color: '#ff5bf8',
      altColor: '#ffe0ff',
      peak: 1.3,
      life: SUPER_RING_LIFE + 0.06,
      rise: 0.27,
      startRadius: [0.22, 0.34],
      endRadius: [2.9, 4.42],
      drift: [0.17, 0.38],
      ringCount: [4, 6],
      scale: [1.07, 1.3],
    },
  },
  unknown: {
    light: {
      color: '#8ad7ff',
      altColor: '#ddf7ff',
      peak: 0.98,
      life: 0.44,
      rise: 0.09,
      startRadius: [0.18, 0.24],
      endRadius: [2, 3],
      drift: [0.04, 0.14],
      ringCount: [1, 1],
      scale: [1, 1],
    },
    heavy: {
      color: '#9edbff',
      altColor: '#d8f2ff',
      peak: 1.18,
      life: 0.62,
      rise: 0.16,
      startRadius: [0.18, 0.28],
      endRadius: [2.3, 3.4],
      drift: [0.08, 0.19],
      ringCount: [2, 2],
      scale: [1, 1.12],
    },
    super: {
      color: '#a3ecff',
      altColor: '#ebfeff',
      peak: 1.25,
      life: SUPER_RING_LIFE,
      rise: 0.24,
      startRadius: [0.22, 0.3],
      endRadius: [2.6, 4],
      drift: [0.12, 0.32],
      ringCount: [4, 5],
      scale: [1.04, 1.14],
    },
  },
};

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

      const family = resolveFighterFamily(hit.moveId);
      const characterProfile = FIGHTER_IMPACT_STYLES[family] ?? FIGHTER_IMPACT_STYLES.unknown;
      const impactProfile = hit.damage >= HEAVY_HIT_THRESHOLD
        ? characterProfile.heavy
        : characterProfile.light;
      const hitIntensity = clamp(hit.damage / 72 + 0.41, 0.58, 1.6);
      const ringCount = clamp(Math.round(MathUtils.lerp(impactProfile.ringCount[0], impactProfile.ringCount[1], hitIntensity)), 1, 4);
      const spread = LANE_SCALE + (Math.min(1, hit.damage / 140) * LEGENDARY_LANE_SCALE);
      const originY = Math.max(MIN_RISE * 0.55, hit.y + 0.02);
      const laneWidth = LANE_SPREAD * (1 + clamp(hit.damage / 180, 0, 0.35));
      for (let index = 0; index < ringCount; index += 1) {
        const lane = ringCount <= 1 ? 0 : index - (ringCount - 1) / 2;
        emitBurst(
          pool.current,
          nextRing,
          hit.x + lane * laneWidth * hit.away,
          originY + 0.01 * index,
          clamp(
            impactProfile.peak * (1 + 0.11 * Math.sin(index * 0.7)) * hitIntensity,
            0.55,
            1.95,
          ),
          clamp(
            impactProfile.life + impactProfile.life * index * 0.08 + (hit.damage >= LEGENDARY_HIT_THRESHOLD ? 0.07 : 0),
            0.28,
            2,
          ),
          {
            rise: impactProfile.rise + 0.022 * Math.abs(lane),
            startRadius: randomRange(impactProfile.startRadius[0], impactProfile.startRadius[1]),
            endRadius: randomRange(impactProfile.endRadius[0], impactProfile.endRadius[1]),
            drift: randomRange(impactProfile.drift[0], impactProfile.drift[1]),
            xScale: clamp(impactProfile.scale[0] + Math.abs(lane) * 0.08 + spread * index, 0.7, 1.45),
            yScale: clamp(impactProfile.scale[1] - Math.abs(lane) * 0.05 + 0.04 * spread, 0.6, 1.9),
            color: index % 2 === 0 ? impactProfile.color : impactProfile.altColor,
            spinRate: 0.55 + index * 0.34 + (hit.damage > LEGENDARY_HIT_THRESHOLD ? 0.4 : 0.14),
            xOffset: lane * 0.12,
          },
        );
      }

      if (hit.damage >= LEGENDARY_HIT_THRESHOLD) {
        emitBurst(
          pool.current,
          nextRing,
          hit.x,
          originY + 0.06,
          impactProfile.peak * 1.18,
          clamp(impactProfile.life * 1.12, 0.52, 1.8),
          {
            rise: impactProfile.rise * 1.18,
            startRadius: 0.22,
            endRadius: 3.6,
            drift: 0.31,
            xScale: impactProfile.scale[0] * 1.18,
            yScale: impactProfile.scale[1] * 1.06,
            color: impactProfile.altColor,
            spinRate: 0.84,
            xOffset: 0,
          },
        );
      }
    }

    if (mimVersion !== superVersions.current.mim && mimFighter !== null) {
      superVersions.current.mim = mimVersion;
      launchSuperPulse(
        pool.current,
        nextRing,
        mimFighter,
        FIGHTER_IMPACT_STYLES.mim.super,
        'mim',
      );
    }
    if (echoVersion !== superVersions.current.echo && echoFighter !== null) {
      superVersions.current.echo = echoVersion;
      launchSuperPulse(
        pool.current,
        nextRing,
        echoFighter,
        FIGHTER_IMPACT_STYLES.echo.super,
        'echo',
      );
    }
    if (chronoVersion !== superVersions.current.chrono && chronoFighter !== null) {
      superVersions.current.chrono = chronoVersion;
      launchSuperPulse(
        pool.current,
        nextRing,
        chronoFighter,
        FIGHTER_IMPACT_STYLES.chrono.super,
        'chrono',
      );
    }
    if (glitchVersion !== superVersions.current.glitch && glitchFighter !== null) {
      superVersions.current.glitch = glitchVersion;
      launchSuperPulse(
        pool.current,
        nextRing,
        glitchFighter,
        FIGHTER_IMPACT_STYLES.glitch.super,
        'glitch',
      );
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
      const eased = easeOutCubic(linear);
      const radius = MathUtils.lerp(pulse.startRadius, pulse.endRadius, eased);
      const pulseKick = 1 - Math.abs(eased - 0.12) * 2.9;
      const alpha = (Math.max(0, pulseKick) * 0.65 + (1 - eased) * 0.55) * pulse.peak;
      const rise = pulse.rise * (1 - eased);
      const drift = 0.18 * (1 - eased);

      const stretch = 1 + (1 - eased) * 0.16;
      pulse.mesh.scale.set(
        radius * pulse.xScale * stretch,
        radius * pulse.yScale * stretch,
        1,
      );
      pulse.mesh.position.set(
        pulse.baseX + pulse.xOffset * (1 + linear * 1.25),
        pulse.baseY + rise,
        GROUND_Z + pulse.depth * (0.35 + drift),
      );
      pulse.mesh.rotation.z += delta * pulse.spinRate;
      pulse.material.opacity = alpha;
      pulse.mesh.visible = alpha > 0.004;
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
  profile: ImpactProfile,
  fighterKey: FighterFamily,
) {
  const fighter = readCombatFighter(fighterId);
  if (fighter === null) return;
  const position = fighter.position;
  const burstCount = clamp(
    Math.round(MathUtils.lerp(profile.ringCount[0], profile.ringCount[1], 0.62)),
    2,
    SUPER_BURST_COUNT,
  );
  for (let index = 0; index < burstCount; index += 1) {
    const lane = burstCount <= 1 ? 0 : index - (burstCount - 1) / 2;
    emitBurst(
      pool,
      nextRing,
      position.x / FIXED_SCALE + lane * LANE_SCALE,
      0.02 + position.y / FIXED_SCALE + lane * 0.03,
      clamp(profile.peak * (1.02 + 0.14 * Math.cos(index * 1.05)), 0.8, 2.1),
      clamp(profile.life * (1 + index * 0.07), 0.55, 2),
      {
        rise: profile.rise + 0.04 * Math.abs(lane),
        startRadius: profile.startRadius[0] + Math.abs(lane) * 0.04,
        endRadius: profile.endRadius[0] + index * 0.24,
        drift: profile.drift[0] + 0.04 * index,
        xScale: profile.scale[0] + index * 0.04,
        yScale: profile.scale[1] + 0.02 * index,
        color: index % 2 === 0 ? profile.color : FIGHTER_IMPACT_STYLES[fighterKey].super.altColor,
        spinRate: 0.42 + index * 0.16 + (index % 2 === 0 ? 0.08 : 0.26),
        xOffset: lane * 0.08,
      },
    );
  }

  emitBurst(
    pool,
    nextRing,
    position.x / FIXED_SCALE,
    0.03 + position.y / FIXED_SCALE,
    profile.peak * 1.28,
    profile.life * 1.22,
    {
      rise: profile.rise * 1.4,
      startRadius: profile.startRadius[1],
      endRadius: profile.endRadius[1] * 1.05,
      drift: profile.drift[1],
      xScale: profile.scale[0] * 1.2,
      yScale: profile.scale[1] * 1.11,
      color: profile.color,
      spinRate: 0.74,
      xOffset: 0,
    },
  );
}

function emitBurst(
  pool: Array<RingPulse>,
  nextRing: { current: number },
  x: number,
  y: number,
  peak: number,
  life: number,
  options: {
    rise?: number;
    color?: ColorRepresentation;
    startRadius?: number;
    endRadius?: number;
    drift?: number;
    xScale?: number;
    yScale?: number;
    spinRate?: number;
    xOffset?: number;
  } = {},
) {
  const ring = pool[nextRing.current % pool.length];
  if (ring === undefined) return;
  nextRing.current = (nextRing.current + 1) % pool.length;

  const rise = clamp(options.rise ?? 0.08, MIN_RISE, MAX_RISE);
  const startRadius = clamp(options.startRadius ?? 0.2, 0.07, 1);
  const endRadius = clamp(options.endRadius ?? (2.4 + Math.random() * 1.4), 0.9, 6.8);

  ring.active = true;
  ring.age = 0;
  ring.life = Math.max(0.14, life);
  ring.startRadius = startRadius + Math.random() * 0.04;
  ring.endRadius = endRadius + Math.random() * 0.5;
  ring.peak = peak;
  ring.rise = rise;
  ring.baseY = clamp(y, 0.01, 1.32);
  ring.baseX = x;
  ring.xOffset = options.xOffset ?? 0;
  ring.depth = clamp(options.drift ?? randomRange(0.03, 0.25), 0.01, 0.37);
  ring.spinRate = options.spinRate ?? (0.34 + Math.random() * 0.7);
  ring.xScale = clamp(options.xScale ?? 1, 0.58, 1.45);
  ring.yScale = clamp(options.yScale ?? 1.06, 0.6, 1.8);
  ring.color.set(options.color ?? '#6fd4ff');
  ring.material.color.copy(ring.color);
  ring.mesh.position.set(x, ring.baseY + ring.rise, GROUND_Z + ring.depth);
  ring.mesh.rotation.z = Math.random() * Math.PI * 2;
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
      baseX: 0,
      baseY: 0.02,
      depth: 0.08,
      spinRate: 0.42,
      drift: 0,
      xOffset: 0,
      xScale: 1,
      yScale: 1,
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function easeOutCubic(t: number): number {
  const clamped = clamp(t, 0, 1);
  return 1 - Math.pow(1 - clamped, 3);
}

function resolveFighterFamily(moveId: string): FighterFamily {
  if (moveId.includes('mim.')) return 'mim';
  if (moveId.includes('echo.')) return 'echo';
  if (moveId.includes('chrono.')) return 'chrono';
  if (moveId.includes('glitch.')) return 'glitch';
  return 'unknown';
}
