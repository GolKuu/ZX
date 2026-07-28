import { CollisionSystem } from '../core/CollisionSystem';
import { balanceConfig } from '../config/balanceConfig';
import type { ArenaTrapSnapshot, FighterSnapshot } from '../core/types';
import type { AttackDefinition } from './AttackDefinition';
import { CharacterPassiveSystem } from './CharacterPassiveSystem';

export class ArenaTrapSystem {
  private readonly collisions = new CollisionSystem();
  private readonly passive = new CharacterPassiveSystem();

  tryCut(
    fighter: FighterSnapshot,
    definition: AttackDefinition | null,
    traps: ArenaTrapSnapshot[],
  ) {
    if (
      fighter.characterId !== 'shira' ||
      !fighter.attack ||
      fighter.attack.phase !== 'active' ||
      !definition
    ) return;

    definition.hitboxes.forEach((hitbox) => {
      if (
        fighter.attack &&
        (fighter.attack.frame < hitbox.startFrame || fighter.attack.frame > hitbox.endFrame)
      ) return;
      const worldHitbox = this.collisions.getHitbox(fighter, hitbox);
      traps.forEach((trap) => {
        if (!trap.active || !trap.cuttable) return;
        const trapBox = {
          x: trap.x - 16,
          y: balanceConfig.groundY - 190,
          width: 32,
          height: 190,
        };
        if (!this.collisions.overlaps(worldHitbox, trapBox)) return;
        trap.active = false;
        this.passive.recordTrapCut(fighter);
      });
    });
  }
}
