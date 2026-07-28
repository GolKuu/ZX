import { characterAttacks } from '../data/attacks/characterAttacks';

export type HitboxAlignmentReport = {
  checked: number;
  errors: string[];
};

export function validateHitboxAlignment(): HitboxAlignmentReport {
  const errors: string[] = [];
  let checked = 0;
  Object.values(characterAttacks).forEach((set) => {
    const attacks = [
      ...set.lightChain, ...set.heavy, set.low, set.lowHeavy, set.air, set.airHeavy,
      set.forwardLight, set.retreatLight, set.dashLight,
      set.forwardHeavy, set.retreatHeavy, set.dashHeavy,
      set.special, set.forwardSpecial, set.retreatSpecial, set.airSpecial,
      set.enhancedSpecial, set.grab, set.forwardThrow, set.backThrow,
      set.reversal, set.superAttack,
    ];
    attacks.forEach((attack) => {
      checked += 1;
      const furthestEdge = Math.max(
        ...attack.hitboxes.map((hitbox) => hitbox.offsetX + hitbox.width),
      );
      if (Math.abs(furthestEdge - attack.visualReach) > 0.01) {
        errors.push(`${attack.id}: visual ${attack.visualReach}, hitbox ${furthestEdge}`);
      }
    });
  });
  return { checked, errors };
}
