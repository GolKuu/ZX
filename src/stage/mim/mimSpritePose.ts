import type { FighterSnapshot } from '../../sim/index.js';
import { FIXED_SCALE } from '../../sim/index.js';
import type { MimAttackButton, MimAnimationBeat } from './mimSpriteTimeline.js';

export interface MimSpritePose {
  readonly torso: number;
  readonly head: number;
  readonly scarf: number;
  readonly leftArm: number;
  readonly rightArm: number;
  readonly leftLeg: number;
  readonly rightLeg: number;
  readonly lift: number;
  readonly drift: number;
}

const NEUTRAL: MimSpritePose = {
  torso: 0,
  head: 0,
  scarf: 0,
  leftArm: 0,
  rightArm: 0,
  leftLeg: 0,
  rightLeg: 0,
  lift: 0,
  drift: 0,
};

const TARGETS: Readonly<Record<MimAttackButton, MimSpritePose>> = {
  lp: pose({ torso: -0.08, head: 0.04, scarf: 0.18, leftArm: -0.12, rightArm: 0.46, leftLeg: 0.08, rightLeg: -0.08, drift: 0.1 }),
  hp: pose({ torso: -0.16, head: 0.08, scarf: 0.32, leftArm: -0.2, rightArm: 0.68, leftLeg: 0.12, rightLeg: -0.12, drift: 0.16 }),
  lk: pose({ torso: 0.28, head: -0.16, scarf: 0.38, leftArm: 0.18, rightArm: -0.18, leftLeg: 0.12, rightLeg: 0.72, lift: -0.24, drift: 0.08 }),
  hk: pose({ torso: -0.22, head: 0.1, scarf: 0.48, leftArm: -0.28, rightArm: 0.22, leftLeg: -0.1, rightLeg: 0.68, lift: -0.04, drift: 0.12 }),
};

export function mimSpritePoseFor(
  fighter: FighterSnapshot,
  time: number,
  beat: MimAnimationBeat | null,
): MimSpritePose {
  if (!fighter.grounded) {
    return pose({ torso: 0.12, leftLeg: 0.52, rightLeg: -0.38, scarf: -0.42 });
  }
  if (beat !== null) {
    return blended(fightingStance(0), TARGETS[beat.button], beat.amount);
  }
  if (fighter.hitstun > 0) {
    const force = Math.min(1, fighter.hitstun / 14);
    return scaled(pose({ torso: -0.4, head: -0.28, scarf: -0.56, leftArm: 0.38, rightArm: 0.5, leftLeg: 0.18, rightLeg: -0.18, drift: -0.1 }), force);
  }
  if (fighter.guarding) {
    return pose({ torso: 0.08, head: -0.04, leftArm: 0.28, rightArm: 0.42, lift: -0.03 });
  }

  const breath = Math.sin(time * 2.2);
  const base = fightingStance(breath);
  const speed = Math.min(
    1,
    Math.abs(fighter.velocity.x) / FIXED_SCALE / 0.58,
  );
  if (speed < 0.02) return base;

  const travelDirection = fighter.velocity.x * fighter.facing >= 0 ? 1 : -1;
  const phase = time * 8.2 * travelDirection;
  const stride = Math.sin(phase) * speed;
  const stepRise = (1 - Math.cos(phase * 2)) * 0.5 * speed;
  return pose({
    ...base,
    torso: base.torso - stride * 0.045,
    head: base.head + stride * 0.025,
    scarf: base.scarf - stride * 0.3,
    leftArm: base.leftArm - stride * 0.22,
    rightArm: base.rightArm + stride * 0.22,
    leftLeg: base.leftLeg + stride * 0.38,
    rightLeg: base.rightLeg - stride * 0.38,
    lift: base.lift + stepRise * 0.04,
  });
}

function pose(overrides: Partial<MimSpritePose>): MimSpritePose {
  return { ...NEUTRAL, ...overrides };
}

function fightingStance(breath: number): MimSpritePose {
  return pose({
    torso: -0.035 + breath * 0.014,
    head: 0.025 - breath * 0.009,
    scarf: 0.1 + breath * 0.065,
    leftArm: 0.05 + breath * 0.018,
    rightArm: -0.045 - breath * 0.018,
    leftLeg: 0.08,
    rightLeg: -0.08,
    lift: -0.035 + breath * 0.012,
  });
}

function scaled(target: MimSpritePose, amount: number): MimSpritePose {
  return {
    torso: target.torso * amount,
    head: target.head * amount,
    scarf: target.scarf * amount,
    leftArm: target.leftArm * amount,
    rightArm: target.rightArm * amount,
    leftLeg: target.leftLeg * amount,
    rightLeg: target.rightLeg * amount,
    lift: target.lift * amount,
    drift: target.drift * amount,
  };
}

function blended(
  from: MimSpritePose,
  to: MimSpritePose,
  amount: number,
): MimSpritePose {
  return {
    torso: from.torso + (to.torso - from.torso) * amount,
    head: from.head + (to.head - from.head) * amount,
    scarf: from.scarf + (to.scarf - from.scarf) * amount,
    leftArm: from.leftArm + (to.leftArm - from.leftArm) * amount,
    rightArm: from.rightArm + (to.rightArm - from.rightArm) * amount,
    leftLeg: from.leftLeg + (to.leftLeg - from.leftLeg) * amount,
    rightLeg: from.rightLeg + (to.rightLeg - from.rightLeg) * amount,
    lift: from.lift + (to.lift - from.lift) * amount,
    drift: from.drift + (to.drift - from.drift) * amount,
  };
}
