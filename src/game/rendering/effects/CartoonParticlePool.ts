import type Phaser from 'phaser';
import type { SimulationSnapshot } from '../../core/types';
import type { EffectLevel, GameSettings } from '../../../stores/settingsStore';

const POOL_SIZE = 36;
const BURST_COUNTS: Record<EffectLevel, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 17,
};

type PooledParticle = {
  shape: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
  lifeMs: number;
  maxLifeMs: number;
};

export class CartoonParticlePool {
  private readonly pool: PooledParticle[];
  private previousHealth: Record<'player1' | 'player2', number> | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly settings: GameSettings,
  ) {
    this.pool = Array.from({ length: POOL_SIZE }, () => ({
      shape: scene.add.circle(-100, -100, 5, 0xff7185)
        .setDepth(13)
        .setVisible(false),
      vx: 0,
      vy: 0,
      lifeMs: 0,
      maxLifeMs: 0,
    }));
  }

  sync(snapshot: SimulationSnapshot, deltaMs: number) {
    this.updateParticles(deltaMs);
    if (!this.previousHealth) {
      this.previousHealth = healthOf(snapshot);
      return;
    }
    for (const playerId of ['player1', 'player2'] as const) {
      const fighter = snapshot.fighters[playerId];
      const damage = this.previousHealth[playerId] - fighter.health;
      if (damage > 0) this.burst(fighter.x, fighter.y - 72, damage);
    }
    this.previousHealth = healthOf(snapshot);
  }

  destroy() {
    this.pool.forEach(({ shape }) => shape.destroy());
  }

  private burst(x: number, y: number, damage: number) {
    const count = Math.min(
      BURST_COUNTS[this.settings.bloodLevel] + Math.floor(damage / 12),
      POOL_SIZE,
    );
    if (count === 0) return;
    this.shake(damage);
    const available = this.pool.filter((particle) => !particle.shape.visible).slice(0, count);
    available.forEach((particle, index) => {
      const spread = index / Math.max(1, available.length - 1) - 0.5;
      particle.vx = spread * 230 + random(-35, 35);
      particle.vy = random(-245, -110) - Math.min(90, damage * 2);
      particle.maxLifeMs = random(360, 620);
      particle.lifeMs = particle.maxLifeMs;
      particle.shape
        .setPosition(x + random(-12, 12), y + random(-8, 8))
        .setRadius(random(3, 7))
        .setFillStyle(index % 3 === 0 ? 0xffd36b : index % 2 === 0 ? 0xff7185 : 0xff91a1)
        .setAlpha(0.9)
        .setVisible(true);
    });
  }

  private updateParticles(deltaMs: number) {
    this.pool.forEach((particle) => {
      if (!particle.shape.visible) return;
      particle.lifeMs -= deltaMs;
      if (particle.lifeMs <= 0) {
        particle.shape.setVisible(false);
        return;
      }
      const seconds = deltaMs / 1_000;
      particle.vy += 510 * seconds;
      particle.shape.x += particle.vx * seconds;
      particle.shape.y += particle.vy * seconds;
      particle.shape.setAlpha(Math.max(0, particle.lifeMs / particle.maxLifeMs));
    });
  }

  private shake(damage: number) {
    if (this.settings.reducedMotion || this.settings.cameraShake === 0) return;
    const strength = [0, 0.0015, 0.003, 0.0048][this.settings.cameraShake];
    this.scene.cameras.main.shake(
      Math.min(150, 55 + damage * 3),
      strength,
      true,
    );
  }
}

function healthOf(snapshot: SimulationSnapshot) {
  return {
    player1: snapshot.fighters.player1.health,
    player2: snapshot.fighters.player2.health,
  };
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}
