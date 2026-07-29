import type { FighterSnapshot } from '@/src/sim';
import { applyZoroAnimation } from './zoroAnimation';
import type { ZoroActionId } from './zoroActions';
import type { ZoroRig } from './zoroRig';
import { setRotation } from './zoroRig';

interface CombatAnimation {
  readonly action: ZoroActionId;
  readonly frames: number;
}

const COMBAT_ANIMATIONS: Readonly<Record<string, CombatAnimation>> = {
  '5L': { action: 'lightPunch', frames: 16 },
  '5M': { action: 'lightKick', frames: 26 },
  '5H': { action: 'heavyPunch', frames: 39 },
  '2L': { action: 'lightPunch', frames: 16 },
  '2M': { action: 'heavyKick', frames: 26 },
  overtake: { action: 'lionSong', frames: 39 },
};

export function applyZoroCombatAnimation(
  rig: ZoroRig,
  fighter: FighterSnapshot,
): void {
  const active = fighter.action === null
    ? undefined
    : COMBAT_ANIMATIONS[fighter.action.moveId];
  if (active !== undefined && fighter.action !== null) {
    applyZoroAnimation(
      rig,
      active.action,
      Math.min(0.999, fighter.action.frame / active.frames),
    );
    return;
  }
  if (fighter.guarding) {
    setRotation(rig.leftArm, 0, 0, 1.05);
    setRotation(rig.rightArm, 0, 0, -1.05);
    setRotation(rig.leftSword, 0, 0, -0.7);
    setRotation(rig.rightSword, 0, 0, 0.7);
  } else if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    setRotation(rig.torso, 0, 0, fighter.facing * recoil * 0.42);
    setRotation(rig.head, 0, 0, fighter.facing * recoil * 0.25);
  }
}
