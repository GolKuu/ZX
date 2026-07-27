import { balanceConfig } from '../config/balanceConfig';
import type { FighterSnapshot } from './types';

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
    if (Math.abs(distance) >= minimumDistance) return;

    const direction = distance >= 0 ? 1 : -1;
    const correction = (minimumDistance - Math.abs(distance)) / 2;
    left.x -= correction * direction;
    right.x += correction * direction;
    this.resolveArena(left);
    this.resolveArena(right);
  }
}
