import type { FighterSnapshot } from '../../sim/state.js';
import type { VorghRageTier } from '../../data/vorgh/types.js';

export interface VorghPose {
  readonly rootX: number; readonly rootY: number; readonly lean: number;
  readonly head: number; readonly frontArm: number; readonly backArm: number;
  readonly frontForearm: number; readonly backForearm: number;
  readonly frontLeg: number; readonly backLeg: number;
  readonly scaleX: number; readonly scaleY: number;
}

export function rageTier(value: number): VorghRageTier {
  if (value >= 100) return 'berserk';
  if (value >= 75) return 'high';
  if (value >= 50) return 'charged';
  if (value >= 25) return 'medium';
  return 'low';
}

export function visualTier(value: number): 'low' | 'medium' | 'high' {
  if (value >= 75) return 'high';
  if (value >= 25) return 'medium';
  return 'low';
}

export function vorghPose(
  fighter: FighterSnapshot,
  time: number,
  transition: number,
): VorghPose {
  if (fighter.health === 0) return pose({ lean: -1.35, rootY: 0.1, scaleY: 0.72 });
  if (fighter.hitstun > 0) {
    const heavy = fighter.hitstun > 22 ? 1 : 0.55;
    return pose({ lean: heavy * 0.52, head: heavy * 0.42, frontArm: -0.7, backArm: 0.48, rootX: -0.08 });
  }
  if (!fighter.grounded) return airPose(fighter);
  if (fighter.guarding) return guardPose(fighter, time);
  if (fighter.action !== null) return actionPose(fighter.action.moveId, fighter.action.frame);
  return idlePose(fighter.resource, time, transition);
}

function idlePose(rage: number, time: number, transition: number): VorghPose {
  const tier = visualTier(rage);
  const cycle = Math.sin(time * (tier === 'low' ? 2.1 : tier === 'medium' ? 2.8 : 3.35));
  const intensity = tier === 'low' ? 0.45 : tier === 'medium' ? 0.72 : 1;
  return pose({
    rootY: Math.abs(cycle) * 0.018 * intensity,
    lean: -0.14 - intensity * 0.12 - transition * 0.05,
    head: 0.08 + cycle * 0.025 * intensity,
    frontArm: -0.72 - intensity * 0.22 + cycle * 0.035,
    backArm: 0.58 + intensity * 0.16 - cycle * 0.03,
    frontForearm: -0.72, backForearm: 0.82,
    frontLeg: -0.18 - intensity * 0.08, backLeg: 0.25 + intensity * 0.1,
  });
}

function guardPose(fighter: FighterSnapshot, time: number): VorghPose {
  const pain = fighter.guardMode === 'pain';
  const crouch = !fighter.grounded || fighter.position.y > 0;
  const impact = fighter.hitstop > 0 ? Math.sin(time * 45) * 0.08 : 0;
  return pose({
    rootY: crouch ? -0.18 : 0, lean: pain ? -0.34 : -0.12,
    head: -0.18, frontArm: -1.52 + impact, backArm: 1.18 - impact,
    frontForearm: -0.2, backForearm: 0.25,
    frontLeg: crouch ? -0.55 : -0.22, backLeg: crouch ? 0.62 : 0.32,
    scaleY: crouch ? 0.9 : 1,
  });
}

function airPose(fighter: FighterSnapshot): VorghPose {
  const rising = fighter.velocity.y > 0;
  return pose({
    rootY: 0.04, lean: rising ? -0.32 : 0.16,
    frontArm: -0.9, backArm: 0.72,
    frontLeg: rising ? -0.72 : -0.28, backLeg: rising ? 0.68 : 0.42,
    scaleY: 0.96,
  });
}

function actionPose(id: string, frame: number): VorghPose {
  const phase = Math.min(1, frame / 12);
  if (id.includes('predator-rake') || id.includes('rage-slash')) {
    return pose({ lean: -0.48, frontArm: -2.2 + phase * 2.45, frontForearm: -0.35, backArm: 0.88, rootX: phase * 0.12 });
  }
  if (id.includes('skull-ram') || id.includes('berserk-dash')) {
    return pose({ lean: -0.78, head: -0.26, frontArm: -0.42, backArm: 0.5, frontLeg: -0.62, backLeg: 0.7, rootX: phase * 0.2 });
  }
  if (id.includes('sweep') || id.includes('crouch-heavy')) {
    return pose({ rootY: -0.34, lean: -0.9, frontLeg: -1.3 + phase * 2.1, backLeg: 0.76, frontArm: -0.4, scaleY: 0.78 });
  }
  if (id.includes('rising-maul') || id.includes('predator-leap')) {
    return pose({ lean: -0.38, frontArm: -2.55, backArm: 2.45, frontForearm: -0.2, backForearm: 0.2, rootY: phase * 0.14 });
  }
  if (id.includes('roar') || id.includes('unchained')) {
    return pose({ lean: 0.02, frontArm: -1.85, backArm: 1.85, frontForearm: -0.2, backForearm: 0.2, scaleX: 1.08, scaleY: 0.94 });
  }
  if (id.includes('air-') || id.includes('meteor')) return pose({ lean: -0.6, frontLeg: -1.1, backLeg: 0.8, frontArm: -1.1 });
  if (id.includes('throw') || id.includes('counter')) return pose({ lean: -0.46, frontArm: -1.3, backArm: 1.12, frontForearm: -0.7, backForearm: 0.64 });
  return pose({ lean: -0.35, frontArm: -1.4, backArm: 1.05, rootX: phase * 0.08 });
}

function pose(overrides: Partial<VorghPose>): VorghPose {
  return {
    rootX: 0, rootY: 0, lean: -0.18, head: 0, frontArm: -0.75,
    backArm: 0.62, frontForearm: -0.55, backForearm: 0.65,
    frontLeg: -0.2, backLeg: 0.25, scaleX: 1, scaleY: 1, ...overrides,
  };
}
