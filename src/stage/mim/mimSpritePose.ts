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
  lk: pose({ torso: 0.2, head: -0.12, scarf: 0.38, leftArm: 0.18, rightArm: -0.18, leftLeg: -0.16, rightLeg: 0.72, lift: -0.12, drift: 0.08 }),
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
  if (beat !== null) return scaled(TARGETS[beat.button], beat.amount);
  if (fighter.hitstun > 0) {
    const force = Math.min(1, fighter.hitstun / 14);
    return scaled(pose({ torso: -0.4, head: -0.28, scarf: -0.56, leftArm: 0.38, rightArm: 0.5, leftLeg: 0.18, rightLeg: -0.18, drift: -0.1 }), force);
  }
  if (fighter.guarding) {
    return pose({ torso: 0.08, head: -0.04, leftArm: 0.28, rightArm: 0.42, lift: -0.03 });
  }

  const speed = Math.min(1, Math.abs(fighter.velocity.x) / FIXED_SCALE / 3.5);
  const stride = Math.sin(time * 7.4) * speed;
  const breath = Math.sin(time * 2.2);
  return pose({
    torso: breath * 0.012,
    head: -breath * 0.008,
    scarf: breath * 0.05 - stride * 0.18,
    leftArm: -stride * 0.16,
    rightArm: stride * 0.16,
    leftLeg: stride * 0.22,
    rightLeg: -stride * 0.22,
    lift: Math.cos(time * 14.8) * speed * 0.02,
  });
}

function pose(overrides: Partial<MimSpritePose>): MimSpritePose {
  return { ...NEUTRAL, ...overrides };
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
