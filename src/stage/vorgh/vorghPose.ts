import { knockdownPoseAmount } from '../../sim/knockdown.js';
import type { FighterSnapshot } from '../../sim/state.js';
import type { VorghRageTier } from '../../data/vorgh/types.js';
import type { VorghPlayback } from './VorghAnimationController.js';

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
  playback?: VorghPlayback,
): VorghPose {
  if (fighter.health === 0) {
    return pose({ lean: -1.35, rootY: 0.1, scaleY: 0.72 });
  }
  if (fighter.knockdownFrames > 0) {
    return blendVorghPose(
      pose({}),
      pose({ lean: -1.35, rootY: 0.1, scaleY: 0.72 }),
      knockdownPoseAmount(fighter),
    );
  }
  if (fighter.hitstun > 0) {
    return reactionPose(playback?.clipId, fighter.hitstun);
  }
  if (playback?.clipId.startsWith('rage-')) return transitionPose(playback);
  if (playback !== undefined && isDefenseClip(playback.clipId)) {
    return defensePose(fighter, time, playback);
  }
  if (fighter.guarding) return guardPose(fighter, time, playback);
  if (!fighter.grounded) return airPose(fighter);
  if (fighter.action !== null) return actionPose(fighter.action.moveId, fighter.action.frame);
  return idlePose(fighter.resource, time, transition, playback);
}

function isDefenseClip(id: string): boolean {
  return id.includes('block')
    || id === 'pain-guard'
    || id === 'guard-crush'
    || id === 'guard-break'
    || id === 'chip-reaction'
    || id === 'cross-up-turn'
    || id.includes('throw-escape');
}

function defensePose(
  fighter: FighterSnapshot,
  time: number,
  playback: VorghPlayback,
): VorghPose {
  const id = playback.clipId;
  const progress = Math.min(1, playback.frame / 7);
  if (id === 'guard-break' || id === 'guard-crush') {
    return pose({
      lean: 0.55 + progress * 0.28, head: 0.42,
      frontArm: -0.18, backArm: 0.2,
      frontForearm: 0.5, backForearm: -0.42,
      rootX: -0.16 * progress, scaleY: 0.94,
    });
  }
  if (id === 'cross-up-turn') {
    return pose({
      lean: -0.25, head: -0.18,
      frontArm: -0.5 - progress, backArm: 0.42 + progress,
      frontLeg: -0.35, backLeg: 0.44, rootX: -0.04,
    });
  }
  if (id.includes('throw-escape')) {
    return pose({
      lean: -0.5, frontArm: -1.7 + progress * 1.15,
      backArm: 1.55 - progress, frontForearm: -0.9,
      backForearm: 0.82, rootX: progress * 0.1,
    });
  }
  const base = guardPose(fighter, time, playback);
  if (id.endsWith('-start')) {
    return { ...base, frontArm: -0.8 - progress * 0.72, backArm: 0.62 + progress * 0.56 };
  }
  if (id.endsWith('-release')) {
    return { ...base, frontArm: -1.52 + progress * 0.78, backArm: 1.18 - progress * 0.56 };
  }
  if (id === 'perfect-block') {
    return { ...base, lean: -0.36, rootX: -0.06, scaleX: 1.04 };
  }
  if (id === 'chip-reaction') {
    return { ...base, lean: 0.08, head: 0.16, rootX: -0.08 };
  }
  return base;
}

function reactionPose(clipId: string | undefined, hitstun: number): VorghPose {
  if (clipId === 'guard-break') {
    return pose({
      lean: 0.82, head: 0.5, frontArm: -0.1, backArm: 0.12,
      frontForearm: 0.4, backForearm: -0.35, rootX: -0.16,
      scaleY: 0.92,
    });
  }
  if (clipId === 'pain-to-power') {
    return pose({
      lean: 0.48, head: -0.3, frontArm: -1.22, backArm: 1.04,
      frontForearm: -0.9, backForearm: 0.82, rootX: -0.1,
      scaleX: 1.06,
    });
  }
  const heavy = hitstun > 22 ? 1 : 0.55;
  return pose({
    lean: heavy * 0.52, head: heavy * 0.42,
    frontArm: -0.7, backArm: 0.48, rootX: -0.08,
  });
}

function idlePose(
  rage: number,
  time: number,
  transition: number,
  playback?: VorghPlayback,
): VorghPose {
  const intensity = Math.min(1, 0.42 + rage / 135);
  const cycle = playback === undefined
    ? Math.sin(time * (2 + intensity * 1.45))
    : Math.sin((playback.frame / 18) * Math.PI * 2);
  const tier = playback?.clipId.replace('idle-', '') ?? visualTier(rage);
  if (tier === 'high') {
    const breath = Math.sin((playback?.frame ?? time * 9) / 18 * Math.PI * 2);
    const coil = Math.max(0, Math.sin((playback?.frame ?? 0) / 18 * Math.PI));
    return pose({
      rootY: Math.abs(breath) * 0.035,
      lean: -0.46 - coil * 0.08,
      head: -0.08 + breath * 0.045,
      frontArm: -1.12 + breath * 0.05,
      backArm: 0.92 - breath * 0.04,
      frontForearm: -0.86, backForearm: 1.02,
      frontLeg: -0.42 - coil * 0.08, backLeg: 0.48 + coil * 0.08,
      scaleX: 1.04, scaleY: 0.96,
    });
  }
  if (tier === 'medium') {
    const shoulder = Math.sin((playback?.frame ?? time * 12) / 9 * Math.PI * 2);
    return pose({
      rootY: Math.abs(cycle) * 0.022,
      lean: -0.3,
      head: 0.03 + cycle * 0.035,
      frontArm: -0.94 + shoulder * 0.07,
      backArm: 0.76 - shoulder * 0.07,
      frontForearm: -0.78, backForearm: 0.9,
      frontLeg: -0.3, backLeg: 0.37,
    });
  }
  return pose({
    rootY: Math.abs(cycle) * 0.012,
    lean: -0.18 - transition * 0.05,
    head: 0.08 + cycle * 0.018,
    frontArm: -0.74 + cycle * 0.018,
    backArm: 0.6 - cycle * 0.016,
    frontForearm: -0.72, backForearm: 0.82,
    frontLeg: -0.18 - intensity * 0.08, backLeg: 0.25 + intensity * 0.1,
  });
}

function guardPose(
  fighter: FighterSnapshot,
  time: number,
  playback?: VorghPlayback,
): VorghPose {
  const pain = fighter.guardMode === 'pain';
  const crouch = fighter.crouching;
  const clipImpact = playback?.clipId.endsWith('heavy') === true ? 0.14 : 0.08;
  const impact = fighter.hitstop > 0 ? Math.sin(time * 45) * clipImpact : 0;
  return pose({
    rootY: fighter.grounded ? (crouch ? -0.18 : 0) : 0.08,
    lean: fighter.grounded ? (pain ? -0.34 : -0.12) : -0.4,
    head: -0.18, frontArm: -1.52 + impact, backArm: 1.18 - impact,
    frontForearm: -0.2, backForearm: 0.25,
    frontLeg: crouch ? -0.55 : -0.22, backLeg: crouch ? 0.62 : 0.32,
    scaleY: crouch ? 0.9 : 1,
  });
}

function transitionPose(playback: VorghPlayback): VorghPose {
  const duration = playback.clipId.includes('high') ? 14 : 12;
  const progress = playback.frame / Math.max(1, duration - 1);
  const surge = Math.sin(progress * Math.PI);
  const rising = playback.clipId.endsWith('high')
    || playback.clipId.endsWith('medium') && playback.clipId.startsWith('rage-low');
  return pose({
    rootY: surge * 0.06,
    lean: -0.18 + (rising ? -0.22 : 0.12) * progress,
    head: -surge * 0.18,
    frontArm: -0.76 - surge * 0.62,
    backArm: 0.64 + surge * 0.54,
    frontLeg: -0.2 - progress * 0.16,
    backLeg: 0.25 + progress * 0.15,
    scaleX: 1 + surge * 0.04,
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
  if (id.includes('last-beast')) {
    const beat = Math.sin(Math.min(1, frame / 58) * Math.PI * 4);
    return pose({
      lean: -0.72 + beat * 0.24, head: -0.2,
      frontArm: -2.3 + beat * 1.4, backArm: 2.08 - beat * 1.2,
      frontLeg: -0.62, backLeg: 0.72, rootX: phase * 0.24,
      scaleX: 1.12, scaleY: 0.94,
    });
  }
  if (id.includes('dominion')) {
    const cross = Math.sin(Math.min(1, frame / 28) * Math.PI * 3);
    return pose({
      lean: -0.58, frontArm: -1.4 + cross * 1.2,
      backArm: 1.3 - cross * 1.15,
      frontForearm: -0.8, backForearm: 0.78,
      frontLeg: -0.4, backLeg: 0.52, rootX: phase * 0.18,
    });
  }
  if (id.includes('armour-breaker') || id.includes('dual-break')) {
    return pose({
      lean: -0.62 + phase * 0.38, frontArm: -2.45 + phase * 1.4,
      backArm: 2.28 - phase * 1.18,
      frontForearm: -0.24, backForearm: 0.2,
      frontLeg: -0.48, backLeg: 0.58, scaleX: 1.08,
    });
  }
  if (id.includes('dual-fang')) {
    const cross = Math.sin(phase * Math.PI * 2);
    return pose({
      lean: -0.46, frontArm: -1.9 + cross * 1.3,
      backArm: 1.72 - cross * 1.2,
      frontForearm: -0.72, backForearm: 0.7, rootX: phase * 0.14,
    });
  }
  if (id.includes('dual-rend')) {
    return pose({
      rootY: -0.2, lean: -0.82, frontArm: -1.1,
      backArm: 0.96, frontLeg: -1.05 + phase * 1.5,
      backLeg: 0.7, rootX: phase * 0.18, scaleY: 0.84,
    });
  }
  if (id.includes('pain-counter')) {
    return pose({
      lean: 0.2 - phase * 0.72, head: -0.2,
      frontArm: -0.36 - phase, backArm: 0.4 + phase * 0.9,
      frontForearm: -0.84, backForearm: 0.78,
    });
  }
  if (id.includes('predator-rake') || id.includes('rage-slash')) {
    return pose({ lean: -0.48, frontArm: -2.2 + phase * 2.45, frontForearm: -0.35, backArm: 0.88, rootX: phase * 0.12 });
  }
  if (id.includes('skull-ram') || id.includes('berserk-dash')) {
    return pose({ lean: -0.78, head: -0.26, frontArm: -0.42, backArm: 0.5, frontLeg: -0.62, backLeg: 0.7, rootX: phase * 0.2 });
  }
  if (id.includes('sweep') || id.includes('crouch-heavy')) {
    return pose({ rootY: -0.34, lean: -0.9, frontLeg: -1.3 + phase * 2.1, backLeg: 0.76, frontArm: -0.4, scaleY: 0.78 });
  }
  if (id.includes('rising-maul')) {
    // L / HK: chamber the knee, then drive the heel above shoulder height.
    // The arms counter-swing instead of delivering the hit, so the silhouette
    // remains unmistakably a kick even under Vorgh's oversized gauntlets.
    const kick = Math.sin(phase * Math.PI * 0.5);
    return pose({
      lean: -0.3 - kick * 0.48,
      head: -kick * 0.14,
      frontArm: -0.72 - kick * 0.38,
      backArm: 0.64 + kick * 0.52,
      frontForearm: -0.62,
      backForearm: 0.58,
      frontLeg: -0.32 + kick * 2.02,
      backLeg: 0.42 + kick * 0.3,
      rootX: kick * 0.12,
      rootY: kick * 0.16,
      scaleX: 1.06,
    });
  }
  if (id.includes('predator-leap')) {
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

function blendVorghPose(
  from: VorghPose,
  to: VorghPose,
  amount: number,
): VorghPose {
  const mix = (first: number, second: number) => first + (second - first) * amount;
  return {
    rootX: mix(from.rootX, to.rootX), rootY: mix(from.rootY, to.rootY),
    lean: mix(from.lean, to.lean), head: mix(from.head, to.head),
    frontArm: mix(from.frontArm, to.frontArm), backArm: mix(from.backArm, to.backArm),
    frontForearm: mix(from.frontForearm, to.frontForearm),
    backForearm: mix(from.backForearm, to.backForearm),
    frontLeg: mix(from.frontLeg, to.frontLeg), backLeg: mix(from.backLeg, to.backLeg),
    scaleX: mix(from.scaleX, to.scaleX), scaleY: mix(from.scaleY, to.scaleY),
  };
}
