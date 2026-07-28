import { balanceConfig } from '../config/balanceConfig';
import type { HitboxDefinition } from '../combat/AttackDefinition';
import type { FighterSnapshot } from './types';

export type WorldRect = { x: number; y: number; width: number; height: number };

export class CollisionSystem {
  resolveArena(fighter: FighterSnapshot) {
    const radius = balanceConfig.fighterRadius;
    fighter.x = Math.min(Math.max(fighter.x, radius), balanceConfig.arenaWidth - radius);

    if (fighter.y >= balanceConfig.groundY) {
      fighter.y = balanceConfig.groundY;
      fighter.velocityY = 0;
      fighter.grounded = true;
    }
  }

  separateFighters(left: FighterSnapshot, right: FighterSnapshot) {
    const minimumDistance = balanceConfig.fighterRadius * 2;
    const distance = right.x - left.x;
    const verticalDistance = Math.abs(right.y - left.y);
    if (verticalDistance > balanceConfig.fighterRadius * 1.45) return;
    if (Math.abs(distance) >= minimumDistance) return;

    const direction = distance >= 0 ? 1 : -1;
    const correction = (minimumDistance - Math.abs(distance)) / 2;
    left.x -= correction * direction;
    right.x += correction * direction;
    this.resolveArena(left);
    this.resolveArena(right);
  }

  getHurtbox(fighter: FighterSnapshot): WorldRect {
    const crouched = fighter.mode === 'crouching' || fighter.guard === 'crouching';
    const height = crouched ? 50 : 76;
    return { x: fighter.x - 31, y: fighter.y - height, width: 62, height };
  }

  getHitbox(fighter: FighterSnapshot, hitbox: HitboxDefinition): WorldRect {
    const x =
      fighter.facing === 1
        ? fighter.x + hitbox.offsetX
        : fighter.x - hitbox.offsetX - hitbox.width;
    return {
      x,
      y: fighter.y + hitbox.offsetY,
      width: hitbox.width,
      height: hitbox.height,
    };
  }

  overlaps(first: WorldRect, second: WorldRect) {
    return (
      first.x < second.x + second.width &&
      first.x + first.width > second.x &&
      first.y < second.y + second.height &&
      first.y + first.height > second.y
    );
  }
}
