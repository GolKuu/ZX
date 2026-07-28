import { describe, expect, it } from 'vitest';
import { EnergyComponent } from '../combat/EnergyComponent';
import { HealthComponent } from '../combat/HealthComponent';
import { CollisionSystem } from '../core/CollisionSystem';
import { createFighter } from '../core/SimulationStateFactory';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';

describe('combat components', () => {
  it('caps health and energy mutations deterministically', () => {
    const fighter = createFighter('player1', 300);
    const health = new HealthComponent();
    const energy = new EnergyComponent();

    expect(health.damage(fighter, 12.4)).toBe(12);
    expect(fighter.health).toBe(fighter.maxHealth - 12);
    energy.gain(fighter, 150);
    expect(fighter.energy).toBe(100);
    expect(energy.spend(fighter, 60)).toBe(true);
    expect(energy.spend(fighter, 60)).toBe(false);
    expect(fighter.energy).toBe(40);
  });

  it('mirrors hitboxes with facing and intersects them with hurtboxes', () => {
    const collision = new CollisionSystem();
    const attacker = createFighter('player1', 430);
    const defender = createFighter('player2', 500);
    const hitbox = getCharacterAttacks('granite').lightChain[0].hitboxes[0];

    expect(collision.overlaps(
      collision.getHitbox(attacker, hitbox),
      collision.getHurtbox(defender),
    )).toBe(true);
    attacker.facing = -1;
    expect(collision.getHitbox(attacker, hitbox).x).toBeLessThan(attacker.x);
  });

  it('covers the visible head with the standing hurtbox', () => {
    const collision = new CollisionSystem();
    const fighter = createFighter('player2', 500);
    const hurtbox = collision.getHurtbox(fighter);
    const headStrike = getCharacterAttacks('granite').lightChain[0].hitboxes[0];

    expect(hurtbox.y).toBe(fighter.y - 190);
    expect(headStrike.offsetY + headStrike.height / 2).toBe(-148);
    expect(collision.overlaps(
      collision.getHitbox(createFighter('player1', 430), headStrike),
      hurtbox,
    )).toBe(true);
  });
});
