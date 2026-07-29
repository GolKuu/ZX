import type { CombatWorldConfig } from './config.js';
import type {
  AuthoredHitbox,
  AuthoredHurtbox,
  HitData,
  MoveFrameData,
} from './frame-data.js';
import {
  assertInteger,
  assertNonNegativeInteger,
  assertRatio,
  type FixedBox,
} from './math.js';
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

export function validateMoves(moves: readonly MoveFrameData[]): void {
  const ids = new Set<string>();
  for (const move of moves) {
    if (move.id.length === 0 || ids.has(move.id)) {
      throw new Error(`Move id must be non-empty and unique: "${move.id}"`);
    }
    ids.add(move.id);
    validateMove(move);
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
    validateBoxes(fighter.hurtboxes, `${fighter.id}.hurtboxes`);
  }
}

function validateMove(move: MoveFrameData): void {
  assertNonNegativeInteger(move.startup, `${move.id}.startup`);
  assertNonNegativeInteger(move.active, `${move.id}.active`);
  assertNonNegativeInteger(move.recovery, `${move.id}.recovery`);
  if (move.active === 0) {
    throw new Error(`${move.id}.active must be at least one frame`);
  }
  const activeFrom = move.startup;
  const activeTo = move.startup + move.active;
  for (const hitbox of move.hitboxes) {
    validateHitbox(hitbox, move.id, activeFrom, activeTo);
  }
  for (const hurtbox of move.hurtboxes ?? []) {
    validateHurtbox(hurtbox, move.id, activeTo + move.recovery);
  }
}

function validateHitbox(
  hitbox: AuthoredHitbox,
  moveId: string,
  activeFrom: number,
  activeTo: number,
): void {
  if (hitbox.hitId.length === 0) {
    throw new Error(`${moveId} contains an empty hitId`);
  }
  validateRange(hitbox.frames.from, hitbox.frames.toExclusive, `${moveId}.${hitbox.hitId}`);
  if (hitbox.frames.from < activeFrom || hitbox.frames.toExclusive > activeTo) {
    throw new Error(`${moveId}.${hitbox.hitId} must stay inside the active frames`);
  }
  validateBoxes(hitbox.boxes, `${moveId}.${hitbox.hitId}.boxes`);
  validateHit(hitbox.hit, `${moveId}.${hitbox.hitId}.hit`);
}

function validateHurtbox(hurtbox: AuthoredHurtbox, moveId: string, total: number): void {
  validateRange(hurtbox.frames.from, hurtbox.frames.toExclusive, `${moveId}.hurtbox`);
  if (hurtbox.frames.toExclusive > total) {
    throw new Error(`${moveId}.hurtbox exceeds the move duration`);
  }
  validateBoxes(hurtbox.boxes, `${moveId}.hurtbox.boxes`);
}

function validateHit(hit: HitData, label: string): void {
  assertNonNegativeInteger(hit.damage, `${label}.damage`);
  assertNonNegativeInteger(hit.hitstop.attacker, `${label}.hitstop.attacker`);
  assertNonNegativeInteger(hit.hitstop.defender, `${label}.hitstop.defender`);
  assertNonNegativeInteger(hit.hitstun, `${label}.hitstun`);
  assertInteger(hit.knockback.x, `${label}.knockback.x`);
  assertInteger(hit.knockback.y, `${label}.knockback.y`);
  if (hit.wallBounce !== undefined) {
    assertNonNegativeInteger(hit.wallBounce.count, `${label}.wallBounce.count`);
    assertNonNegativeInteger(
      hit.wallBounce.horizontalSpeed,
      `${label}.wallBounce.horizontalSpeed`,
    );
    assertNonNegativeInteger(
      hit.wallBounce.verticalSpeed,
      `${label}.wallBounce.verticalSpeed`,
    );
    assertNonNegativeInteger(
      hit.wallBounce.minimumHitstun,
      `${label}.wallBounce.minimumHitstun`,
    );
    if (hit.wallBounce.count > 0 && hit.wallBounce.horizontalSpeed === 0) {
      throw new Error(`${label}.wallBounce.horizontalSpeed must be positive`);
    }
  }
  if (hit.groundBounce !== undefined) {
    assertNonNegativeInteger(hit.groundBounce.count, `${label}.groundBounce.count`);
    assertNonNegativeInteger(
      hit.groundBounce.verticalSpeed,
      `${label}.groundBounce.verticalSpeed`,
    );
    assertRatio(hit.groundBounce.horizontalScale, `${label}.groundBounce.horizontalScale`);
    assertNonNegativeInteger(
      hit.groundBounce.minimumHitstun,
      `${label}.groundBounce.minimumHitstun`,
    );
    if (hit.groundBounce.count > 0 && hit.groundBounce.verticalSpeed === 0) {
      throw new Error(`${label}.groundBounce.verticalSpeed must be positive`);
    }
  }
}

function validateBoxes(boxes: readonly FixedBox[], label: string): void {
  if (boxes.length === 0) {
    throw new Error(`${label} must contain at least one box`);
  }
  boxes.forEach((box, index) => {
    assertInteger(box.offset.x, `${label}[${index}].offset.x`);
    assertInteger(box.offset.y, `${label}[${index}].offset.y`);
    assertInteger(box.halfSize.x, `${label}[${index}].halfSize.x`);
    assertInteger(box.halfSize.y, `${label}[${index}].halfSize.y`);
    if (box.halfSize.x <= 0 || box.halfSize.y <= 0) {
      throw new Error(`${label}[${index}].halfSize must be positive`);
    }
  });
}

function validateRange(from: number, toExclusive: number, label: string): void {
  assertNonNegativeInteger(from, `${label}.frames.from`);
  assertNonNegativeInteger(toExclusive, `${label}.frames.toExclusive`);
  if (from >= toExclusive) {
    throw new Error(`${label}.frames must be a non-empty half-open range`);
  }
}
