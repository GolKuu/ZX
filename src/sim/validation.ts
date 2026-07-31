import type { CombatWorldConfig } from './config.js';
import { validateBoxes } from './geometry-validation.js';
import {
  assertInteger,
  assertNonNegativeInteger,
  assertRatio,
} from './math.js';
export { validateMoves } from './move-validation.js';
import type { FighterDefinition } from './state.js';

export function validateWorldConfig(config: CombatWorldConfig): void {
  assertInteger(config.groundY, 'world.groundY');
  assertInteger(config.leftWall, 'world.leftWall');
  assertInteger(config.rightWall, 'world.rightWall');
  if (config.leftWall >= config.rightWall) {
    throw new Error('world.leftWall must be less than world.rightWall');
  }
  assertNonNegativeInteger(config.gravityPerFrame, 'world.gravityPerFrame');
  assertRatio(config.groundFriction, 'world.groundFriction');
  assertInteger(config.maximumVelocity, 'world.maximumVelocity');
  if (config.maximumVelocity <= 0) {
    throw new Error('world.maximumVelocity must be positive');
  }
}

export function validateFighters(
  fighters: readonly FighterDefinition[],
  config: CombatWorldConfig,
): void {
  if (fighters.length < 2) {
    throw new Error('Combat requires at least two fighters');
  }
  const ids = new Set<string>();
  for (const fighter of fighters) {
    if (fighter.id.length === 0 || ids.has(fighter.id)) {
      throw new Error(`Fighter id must be non-empty and unique: "${fighter.id}"`);
    }
    ids.add(fighter.id);
    assertInteger(fighter.team, `${fighter.id}.team`);
    assertInteger(fighter.maxHealth, `${fighter.id}.maxHealth`);
    if (fighter.maxHealth <= 0) {
      throw new Error(`${fighter.id}.maxHealth must be positive`);
    }
    assertInteger(fighter.spawn.x, `${fighter.id}.spawn.x`);
    assertInteger(fighter.spawn.y, `${fighter.id}.spawn.y`);
    if (fighter.spawn.x < config.leftWall || fighter.spawn.x > config.rightWall) {
      throw new Error(`${fighter.id}.spawn.x must be inside the arena`);
    }
    if (fighter.spawn.y < config.groundY) {
      throw new Error(`${fighter.id}.spawn.y cannot be below the ground`);
    }
    if (fighter.facing !== -1 && fighter.facing !== 1) {
      throw new Error(`${fighter.id}.facing must be -1 or 1`);
    }
    if (fighter.movement !== undefined) {
      assertNonNegativeInteger(
        fighter.movement.forwardPerFrame,
        `${fighter.id}.movement.forwardPerFrame`,
      );
      assertNonNegativeInteger(
        fighter.movement.backwardPerFrame,
        `${fighter.id}.movement.backwardPerFrame`,
      );
    }
    validateBoxes(fighter.hurtboxes, `${fighter.id}.hurtboxes`);
    if (fighter.resource !== undefined) {
      assertNonNegativeInteger(fighter.resource.maximum, `${fighter.id}.resource.maximum`);
      assertNonNegativeInteger(fighter.resource.initial ?? 0, `${fighter.id}.resource.initial`);
      assertNonNegativeInteger(
        fighter.resource.damageTakenPercent,
        `${fighter.id}.resource.damageTakenPercent`,
      );
    }
  }
}
