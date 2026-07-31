import type {
  AuthoredHitbox,
  AuthoredHurtbox,
  HitData,
  MoveFrameData,
} from './frame-data.js';
import { validateBoxes, validateRange } from './geometry-validation.js';
import {
  assertInteger,
  assertNonNegativeInteger,
  assertRatio,
} from './math.js';

export function validateMoves(moves: readonly MoveFrameData[]): void {
  const ids = new Set<string>();
  for (const move of moves) {
    if (move.id.length === 0 || ids.has(move.id)) {
      throw new Error(`Move id must be non-empty and unique: "${move.id}"`);
    }
    ids.add(move.id);
    validateMove(move);
  }
  for (const move of moves) {
    for (const cancel of move.cancels ?? []) {
      for (const target of cancel.into) {
        if (!ids.has(target)) {
          throw new Error(`${move.id}.cancel references unknown move "${target}"`);
        }
      }
    }
  }
}

function validateMove(move: MoveFrameData): void {
  assertNonNegativeInteger(move.startup, `${move.id}.startup`);
  assertNonNegativeInteger(move.active, `${move.id}.active`);
  assertNonNegativeInteger(move.recovery, `${move.id}.recovery`);
  if (move.active === 0) {
    throw new Error(`${move.id}.active must be at least one frame`);
  }
  assertNonNegativeInteger(move.minimumResource ?? 0, `${move.id}.minimumResource`);
  assertNonNegativeInteger(move.resourceCost ?? 0, `${move.id}.resourceCost`);
  assertNonNegativeInteger(move.resourceGainOnHit ?? 0, `${move.id}.resourceGainOnHit`);
  assertNonNegativeInteger(move.resourceGainOnBlock ?? 0, `${move.id}.resourceGainOnBlock`);
  if (move.armour !== undefined) {
    validateRange(move.armour.frames.from, move.armour.frames.toExclusive, `${move.id}.armour`);
    assertNonNegativeInteger(move.armour.hits, `${move.id}.armour.hits`);
    assertNonNegativeInteger(move.armour.damagePercent, `${move.id}.armour.damagePercent`);
  }
  const activeTo = move.startup + move.active;
  move.hitboxes.forEach((hitbox) =>
    validateHitbox(hitbox, move.id, move.startup, activeTo),
  );
  move.hurtboxes?.forEach((hurtbox) =>
    validateHurtbox(hurtbox, move.id, activeTo + move.recovery),
  );
  for (const cancel of move.cancels ?? []) {
    validateRange(cancel.frames.from, cancel.frames.toExclusive, `${move.id}.cancel`);
    if (cancel.frames.toExclusive > activeTo + move.recovery) {
      throw new Error(`${move.id}.cancel exceeds the move duration`);
    }
    if (cancel.into.length === 0) {
      throw new Error(`${move.id}.cancel must contain a target move`);
    }
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

function validateHurtbox(
  hurtbox: AuthoredHurtbox,
  moveId: string,
  total: number,
): void {
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
  validateBlock(hit, label);
  validateWallBounce(hit, label);
  validateGroundBounce(hit, label);
}

function validateBlock(hit: HitData, label: string): void {
  if (hit.block === undefined) {
    return;
  }
  assertNonNegativeInteger(hit.block.blockstun, `${label}.block.blockstun`);
  assertNonNegativeInteger(hit.block.chipDamage ?? 0, `${label}.block.chipDamage`);
  assertNonNegativeInteger(hit.block.guardDamage ?? 0, `${label}.block.guardDamage`);
  assertNonNegativeInteger(hit.block.hitstop.attacker, `${label}.block.hitstop.attacker`);
  assertNonNegativeInteger(hit.block.hitstop.defender, `${label}.block.hitstop.defender`);
  assertInteger(hit.block.knockback.x, `${label}.block.knockback.x`);
  assertInteger(hit.block.knockback.y, `${label}.block.knockback.y`);
}

function validateWallBounce(hit: HitData, label: string): void {
  if (hit.wallBounce === undefined) {
    return;
  }
  assertNonNegativeInteger(hit.wallBounce.count, `${label}.wallBounce.count`);
  assertNonNegativeInteger(hit.wallBounce.horizontalSpeed, `${label}.wallBounce.horizontalSpeed`);
  assertNonNegativeInteger(hit.wallBounce.verticalSpeed, `${label}.wallBounce.verticalSpeed`);
  assertNonNegativeInteger(hit.wallBounce.minimumHitstun, `${label}.wallBounce.minimumHitstun`);
  if (hit.wallBounce.count > 0 && hit.wallBounce.horizontalSpeed === 0) {
    throw new Error(`${label}.wallBounce.horizontalSpeed must be positive`);
  }
}

function validateGroundBounce(hit: HitData, label: string): void {
  if (hit.groundBounce === undefined) {
    return;
  }
  assertNonNegativeInteger(hit.groundBounce.count, `${label}.groundBounce.count`);
  assertNonNegativeInteger(hit.groundBounce.verticalSpeed, `${label}.groundBounce.verticalSpeed`);
  assertRatio(hit.groundBounce.horizontalScale, `${label}.groundBounce.horizontalScale`);
  assertNonNegativeInteger(hit.groundBounce.minimumHitstun, `${label}.groundBounce.minimumHitstun`);
  if (hit.groundBounce.count > 0 && hit.groundBounce.verticalSpeed === 0) {
    throw new Error(`${label}.groundBounce.verticalSpeed must be positive`);
  }
}
