import type { AttackHit, FighterSnapshot, GameAction } from '../core/types';

export class BlockSystem {
  update(defender: FighterSnapshot, actions: readonly GameAction[]) {
    const canBlock = defender.mode !== 'hitstun' && defender.mode !== 'knockout';
    if (actions.includes('block') && canBlock) {
      defender.mode = 'blocking';
      defender.modeTicksRemaining = 0;
      return;
    }

    if (defender.mode === 'blocking') defender.mode = 'idle';
  }

  reduce(hit: AttackHit, defender: FighterSnapshot): AttackHit {
    if (defender.mode !== 'blocking') return hit;
    return { ...hit, damage: Math.max(1, Math.round(hit.damage * 0.25)), hitstunTicks: 4 };
  }
}
