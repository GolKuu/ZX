import type { PlayerId } from '../core/types';

export type ProjectileSnapshot = {
  ownerId: PlayerId;
  x: number;
  y: number;
  velocityX: number;
  active: boolean;
};

export class ProjectileSystem {
  step(projectile: ProjectileSnapshot, stepSeconds: number) {
    if (projectile.active) projectile.x += projectile.velocityX * stepSeconds;
  }
}
