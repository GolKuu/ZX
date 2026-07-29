import { DEFAULT_WORLD_CONFIG, type CombatWorldConfig } from './config.js';
import type { MoveFrameData } from './frame-data.js';
import type { FixedBox } from './math.js';
import type { FighterDefinition, MutableFighterState } from './state.js';

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
    hitstop: 0,
    hitstun: 0,
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
  };
}

function copyBoxes(boxes: readonly FixedBox[]): readonly FixedBox[] {
  return boxes.map((box) => ({
    offset: { ...box.offset },
    halfSize: { ...box.halfSize },
  }));
}
