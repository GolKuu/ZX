import { DEFAULT_WORLD_CONFIG, type CombatWorldConfig } from './config.js';
import type { MoveFrameData } from './frame-data.js';
import type { FixedBox } from './math.js';
import type { FighterDefinition, MutableFighterState } from './state.js';
import { DEFAULT_IMPACT_ARMOUR } from './knockdown.js';

export function copyWorldConfig(
  overrides: Partial<CombatWorldConfig> | undefined,
): CombatWorldConfig {
  const groundFriction = overrides?.groundFriction ?? DEFAULT_WORLD_CONFIG.groundFriction;
  return {
    ...DEFAULT_WORLD_CONFIG,
    ...overrides,
    groundFriction: { ...groundFriction },
  };
}

export function copyMove(move: MoveFrameData): MoveFrameData {
  return {
    id: move.id,
    attackLevel: move.attackLevel,
    startup: move.startup,
    active: move.active,
    recovery: move.recovery,
    hitboxes: move.hitboxes.map((hitbox) => ({
      hitId: hitbox.hitId,
      frames: { ...hitbox.frames },
      boxes: copyBoxes(hitbox.boxes),
      hit: {
        damage: hitbox.hit.damage,
        hitstop: { ...hitbox.hit.hitstop },
        hitstun: hitbox.hit.hitstun,
        knockback: { ...hitbox.hit.knockback },
        block:
          hitbox.hit.block === undefined
            ? undefined
            : {
                blockstun: hitbox.hit.block.blockstun,
                hitstop: { ...hitbox.hit.block.hitstop },
                knockback: { ...hitbox.hit.block.knockback },
                chipDamage: hitbox.hit.block.chipDamage,
                guardDamage: hitbox.hit.block.guardDamage,
                guardBreak: hitbox.hit.block.guardBreak,
              },
        wallBounce:
          hitbox.hit.wallBounce === undefined
            ? undefined
            : { ...hitbox.hit.wallBounce },
        groundBounce:
          hitbox.hit.groundBounce === undefined
            ? undefined
            : {
                ...hitbox.hit.groundBounce,
                horizontalScale: { ...hitbox.hit.groundBounce.horizontalScale },
              },
      },
    })),
    hurtboxes: move.hurtboxes?.map((hurtbox) => ({
      frames: { ...hurtbox.frames },
      boxes: copyBoxes(hurtbox.boxes),
    })),
    cancels: move.cancels?.map((cancel) => ({
      frames: { ...cancel.frames },
      into: [...cancel.into],
    })),
    obstacle: move.obstacle === undefined
      ? undefined
      : {
          box: {
            offset: { ...move.obstacle.box.offset },
            halfSize: { ...move.obstacle.box.halfSize },
          },
          hitsToBreak: move.obstacle.hitsToBreak,
        },
    walls: move.walls?.map((wall) => ({
      ...wall,
      offset: { ...wall.offset },
      halfSize: { ...wall.halfSize },
    })),
    wallCommand: move.wallCommand === undefined
      ? undefined
      : { ...move.wallCommand },
    wallPiercing: move.wallPiercing,
    wallDamage: move.wallDamage,
    counter: move.counter === undefined
      ? undefined
      : { ...move.counter, frames: { ...move.counter.frames } },
    onHitFollowUp: move.onHitFollowUp,
    onWhiffFollowUp: move.onWhiffFollowUp,
    minimumResource: move.minimumResource,
    resourceCost: move.resourceCost,
    resourceGainOnHit: move.resourceGainOnHit,
    resourceGainOnBlock: move.resourceGainOnBlock,
    armour: move.armour === undefined
      ? undefined
      : { ...move.armour, frames: { ...move.armour.frames } },
    status: move.status === undefined ? undefined : {
      ...move.status,
      cancelInto: move.status.cancelInto === undefined
        ? undefined
        : [...move.status.cancelInto],
      cancelFrom: move.status.cancelFrom === undefined
        ? undefined
        : [...move.status.cancelFrom],
    },
    grapple: move.grapple === undefined ? undefined : { ...move.grapple },
    displacements: move.displacements?.map((displacement) => ({
      ...displacement,
      offset: { ...displacement.offset },
    })),
    airCombo: move.airCombo === undefined ? undefined : { ...move.airCombo },
    cooldownFrames: move.cooldownFrames,
  };
}

export function createFighterState(
  definition: FighterDefinition,
  groundY: number,
): MutableFighterState {
  return {
    id: definition.id,
    team: definition.team,
    maxHealth: definition.maxHealth,
    defaultHurtboxes: copyBoxes(definition.hurtboxes),
    movement: {
      forwardPerFrame: definition.movement?.forwardPerFrame ?? 65,
      backwardPerFrame: definition.movement?.backwardPerFrame ?? 53,
      jumpPerFrame: definition.movement?.jumpPerFrame ?? 340,
    },
    health: definition.maxHealth,
    position: { ...definition.spawn },
    previousPosition: { ...definition.spawn },
    velocity: { x: 0, y: 0 },
    facing: definition.facing,
    grounded: definition.spawn.y === groundY,
    guarding: false,
    crouching: false,
    guardMode: 'normal',
    guardFrames: 0,
    guardHealth: 100,
    hitstop: 0,
    hitstun: 0,
    impactArmour: definition.impactArmour ?? DEFAULT_IMPACT_ARMOUR,
    knockdownFrames: 0,
    knockdownPhase: 'none',
    knockdownCooldownFrames: 0,
    recoveryPercent: 100,
    resource: definition.resource?.initial ?? 0,
    resourceMaximum: definition.resource?.maximum ?? 0,
    resourceLockFrames: 0,
    resourceOverdrive: false,
    resourceDrainCounter: 0,
    resourceRules: definition.resource === undefined
      ? null
      : { ...definition.resource },
    statusId: null,
    statusFrames: 0,
    statusResourceDrainCounter: 0,
    statusArmourHitsUsed: 0,
    statusArmourHitsMaximum: 0,
    statusArmourDamagePercent: 100,
    dashFrames: 0,
    dashDirection: 0,
    lungeFrames: 0,
    action: null,
    bounce: {
      wallRemaining: 0,
      wallHorizontalSpeed: 0,
      wallVerticalSpeed: 0,
      wallMinimumHitstun: 0,
      groundRemaining: 0,
      groundVerticalSpeed: 0,
      groundHorizontalNumerator: 1,
      groundHorizontalDenominator: 1,
      groundMinimumHitstun: 0,
    },
    airJuggleHits: 0,
    lastAirHitMoveId: null,
    repeatedAirHitCount: 0,
    comboHitsTaken: 0,
    moveCooldowns: {},
    wallRun: { phase: 'none', wallId: null, frame: 0, climb: 0 },
  };
}

function copyBoxes(boxes: readonly FixedBox[]): readonly FixedBox[] {
  return boxes.map((box) => ({
    offset: { ...box.offset },
    halfSize: { ...box.halfSize },
  }));
}
