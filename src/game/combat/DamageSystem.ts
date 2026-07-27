import type { AttackHit, FighterSnapshot } from '../core/types';

export class DamageSystem {
  apply(defender: FighterSnapshot, hit: AttackHit) {
    defender.health = Math.max(0, defender.health - hit.damage);
    defender.mode = defender.health === 0 ? 'knockout' : 'hitstun';
    defender.modeTicksRemaining = defender.health === 0 ? 0 : hit.hitstunTicks;
  }
}
