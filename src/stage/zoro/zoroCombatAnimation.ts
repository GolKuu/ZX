import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { applyZoroAnimation } from './zoroAnimation';
import type { ZoroActionId } from './zoroActions';
import type { ZoroRig } from './zoroRig';
import { setRotation } from './zoroRig';

interface CombatAnimation {
  readonly action: ZoroActionId;
}

const COMBAT_ANIMATIONS: Readonly<Record<string, CombatAnimation>> = {
  '5L': { action: 'lightPunch' },
  '5M': { action: 'lightKick' },
  '5H': { action: 'heavyPunch' },
  '2L': { action: 'lightPunch' },
  '2M': { action: 'heavyKick' },
  overtake: { action: 'lionSong' },
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
      combatAnimationProgress(fighter.action.moveId, fighter.action.frame),
      fighter.facing,
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
