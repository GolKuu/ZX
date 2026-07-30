import { activeHitboxes, activeHurtboxes, toWorldBox } from './collision.js';
import type { FighterDebugFrame } from './events.js';
import { movePhaseAt, type MoveFrameData } from './frame-data.js';
import type {
  FighterSnapshot,
  MutableFighterState,
  WorldSnapshot,
} from './state.js';

export function readWorld(
  frame: number,
  fighters: readonly MutableFighterState[],
): WorldSnapshot {
  return {
    frame,
    fighters: fighters.map(snapshotFighter),
  };
}

export function readDebugFrames(
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
): readonly FighterDebugFrame[] {
  return fighters.map((fighter) => {
    const move =
      fighter.action === null ? undefined : moves.get(fighter.action.moveId);
    return {
      fighterId: fighter.id,
      moveId: move?.id ?? null,
      moveFrame: fighter.action?.frame ?? null,
      phase:
        move === undefined || fighter.action === null
          ? null
          : movePhaseAt(move, fighter.action.frame),
      hitboxes:
        move === undefined
          ? []
          : activeHitboxes(fighter, move).flatMap((hitbox) =>
              hitbox.boxes.map((box) => toWorldBox(fighter, box)),
            ),
      hurtboxes: activeHurtboxes(fighter, move).map((box) =>
        toWorldBox(fighter, box),
      ),
    };
  });
}

function snapshotFighter(fighter: MutableFighterState): FighterSnapshot {
  return {
    id: fighter.id,
    team: fighter.team,
    health: fighter.health,
    maxHealth: fighter.maxHealth,
    position: { ...fighter.position },
    previousPosition: { ...fighter.previousPosition },
    velocity: { ...fighter.velocity },
    facing: fighter.facing,
    grounded: fighter.grounded,
    guarding: fighter.guarding,
    dashFrames: fighter.dashFrames,
    hitstop: fighter.hitstop,
    hitstun: fighter.hitstun,
    action:
      fighter.action === null
        ? null
        : {
            moveId: fighter.action.moveId,
            frame: fighter.action.frame,
            serial: fighter.action.serial,
          },
  };
}
