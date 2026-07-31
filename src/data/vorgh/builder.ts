import type {
  GroundBounceData,
  MoveArmourData,
  MoveCounterData,
  MoveFrameData,
  WallBounceData,
} from '../../sim/frame-data.js';
import { fixed } from '../../sim/math.js';
import type { VorghAttackLevel, VorghMoveSpec } from './types.js';

type Box = readonly [x: number, y: number, halfWidth: number, halfHeight: number];
type Hit = {
  readonly id?: string; readonly from?: number; readonly to?: number;
  readonly box: Box; readonly damage: number; readonly hitstun: number;
  readonly blockstun?: number; readonly hitstop?: readonly [number, number];
  readonly push?: readonly [number, number]; readonly chip?: number;
  readonly guardDamage?: number; readonly guardBreak?: boolean;
  readonly groundBounce?: GroundBounceData; readonly wallBounce?: WallBounceData;
};
export type VorghRow = {
  readonly id: string; readonly name: string; readonly level: VorghAttackLevel;
  readonly startup: number; readonly active: number; readonly recovery: number;
  readonly hits: readonly Hit[]; readonly cancels?: readonly string[];
  readonly rageGain?: number; readonly rageCost?: number; readonly minimumRage?: number;
  readonly armour?: MoveArmourData; readonly counter?: MoveCounterData;
  readonly followUp?: string; readonly tags?: readonly string[];
  readonly status?: MoveFrameData['status'];
  readonly displacements?: MoveFrameData['displacements'];
  readonly grapple?: MoveFrameData['grapple'];
};

export function buildVorgh(row: VorghRow): VorghMoveSpec {
  const end = row.startup + row.active;
  const move: MoveFrameData = {
    id: row.id, attackLevel: row.level,
    startup: row.startup, active: row.active, recovery: row.recovery,
    hitboxes: row.hits.map((hit, index) => ({
      hitId: hit.id ?? `hit-${index + 1}`,
      frames: { from: hit.from ?? row.startup, toExclusive: hit.to ?? end },
      boxes: [box(hit.box)],
      hit: {
        damage: hit.damage,
        hitstop: { attacker: hit.hitstop?.[0] ?? 8, defender: hit.hitstop?.[1] ?? 11 },
        hitstun: hit.hitstun,
        knockback: { x: fixed(hit.push?.[0] ?? 0.12), y: fixed(hit.push?.[1] ?? 0) },
        block: hit.blockstun === undefined ? undefined : {
          blockstun: hit.blockstun,
          hitstop: { attacker: hit.hitstop?.[0] ?? 8, defender: hit.hitstop?.[1] ?? 11 },
          knockback: { x: fixed(hit.push?.[0] ?? 0.12), y: fixed(0) },
          chipDamage: hit.chip, guardDamage: hit.guardDamage,
          guardBreak: hit.guardBreak,
        },
        groundBounce: hit.groundBounce, wallBounce: hit.wallBounce,
      },
    })),
    cancels: row.cancels === undefined ? undefined : [{
      frames: { from: row.startup, toExclusive: end + Math.max(1, row.recovery - 4) },
      into: [...row.cancels],
    }],
    minimumResource: row.minimumRage,
    resourceCost: row.rageCost,
    resourceGainOnHit: row.rageGain,
    resourceGainOnBlock: Math.floor((row.rageGain ?? 0) / 2),
    armour: row.armour, counter: row.counter, onHitFollowUp: row.followUp,
    status: row.status,
    displacements: row.displacements,
    grapple: row.grapple,
    hurtboxes: hurtboxesFor(row),
  };
  const tags = row.tags ?? [];
  return {
    move, name: row.name, attackLevel: row.level,
    rageGain: row.rageGain ?? 0, rageCost: row.rageCost ?? 0,
    presentation: {
      animation: row.id,
      vfx: tags.map((tag) => `vorgh.vfx.${tag}`),
      sounds: [`vorgh.voice.effort`, `vorgh.sfx.${tags[0] ?? 'strike'}`],
      camera: tags.includes('super') ? ['freeze.8', 'shake.heavy'] : ['shake.light'],
    },
  };
}

function hurtboxesFor(row: VorghRow) {
  const crouched = row.id.includes('crouch') || row.id.includes('sweep');
  const airborne = row.id.includes('air-') || row.id.includes('leap');
  const base = crouched
    ? [-0.08, 0.72, 0.38, 0.68]
    : airborne
      ? [-0.12, 1.18, 0.4, 0.72]
      : [-0.1, 1.08, 0.42, 0.98];
  const extended = [...base] as [number, number, number, number];
  extended[0] += row.level === 'low' ? 0.08 : 0.14;
  extended[2] += 0.08;
  const total = row.startup + row.active + row.recovery;
  return [
    {
      frames: { from: 0, toExclusive: row.startup },
      boxes: [box([base[0] - 0.04, base[1], base[2] - 0.04, base[3]])],
    },
    {
      frames: { from: row.startup, toExclusive: row.startup + row.active },
      boxes: [box(extended)],
    },
    {
      frames: { from: row.startup + row.active, toExclusive: total },
      boxes: [box(base as [number, number, number, number])],
    },
  ];
}

function box(value: Box) {
  return {
    offset: { x: fixed(value[0]), y: fixed(value[1]) },
    halfSize: { x: fixed(value[2]), y: fixed(value[3]) },
  };
}
