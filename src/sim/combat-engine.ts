import { activeHitboxes, activeHurtboxes, toWorldBox } from './collision.js';
import type { CombatWorldConfig } from './config.js';
import { copyMove, copyWorldConfig, createFighterState } from './copy.js';
import { collectHitCandidates, contactKey } from './detection.js';
import type { CombatEvent, FighterDebugFrame } from './events.js';
import { movePhaseAt, totalMoveFrames, type MoveFrameData } from './frame-data.js';
import { integrateFighter } from './physics.js';
import { resolveHit } from './resolve.js';
import type {
  CombatInputs,
  FighterDefinition,
  FighterSnapshot,
  MutableFighterState,
  WorldSnapshot,
} from './state.js';
import {
  validateFighters,
  validateMoves,
  validateWorldConfig,
} from './validation.js';

export interface CombatEngineOptions {
  readonly moves: readonly MoveFrameData[];
  readonly fighters: readonly FighterDefinition[];
  readonly world?: Partial<CombatWorldConfig>;
}

export interface CombatTickResult {
  readonly state: WorldSnapshot;
  readonly events: readonly CombatEvent[];
}

export class CombatEngine {
  private readonly config: CombatWorldConfig;
  private readonly moves: ReadonlyMap<string, MoveFrameData>;
  private readonly fighters: MutableFighterState[];
  private completedFrames = 0;
  private nextActionSerial = 1;

  public constructor(options: CombatEngineOptions) {
    this.config = copyWorldConfig(options.world);
    const copiedMoves = options.moves.map(copyMove);
    validateWorldConfig(this.config);
    validateMoves(copiedMoves);
    validateFighters(options.fighters, this.config);
    this.moves = new Map(copiedMoves.map((move) => [move.id, move]));
    this.fighters = options.fighters
      .map((fighter) => createFighterState(fighter, this.config.groundY))
      .sort((first, second) => compareIds(first.id, second.id));
  }

  public get frame(): number {
    return this.completedFrames;
  }

  public tick(inputs: CombatInputs = {}): CombatTickResult {
    this.validateInputs(inputs);
    const events: CombatEvent[] = [];
    const frozen = new Set<string>();

    for (const fighter of this.fighters) {
      fighter.previousPosition.x = fighter.position.x;
      fighter.previousPosition.y = fighter.position.y;
      if (fighter.hitstop > 0) {
        fighter.hitstop -= 1;
        frozen.add(fighter.id);
        continue;
      }
      this.tryStartMove(fighter, inputs[fighter.id], events);
      integrateFighter(fighter, this.config, this.completedFrames, events);
    }

    const candidates = collectHitCandidates(
      this.fighters,
      this.moves,
      this.config.friendlyFire ?? false,
    );
    for (const candidate of candidates) {
      const action = candidate.attacker.action;
      if (action?.serial === candidate.actionSerial) {
        action.hitLedger.push(contactKey(candidate.hitbox.hitId, candidate.defender.id));
      }
    }

    const hitThisFrame = new Set<string>();
    for (const candidate of candidates) {
      resolveHit(candidate, this.completedFrames, this.config.maximumVelocity, events);
      hitThisFrame.add(candidate.defender.id);
    }

    const bouncedThisFrame = new Set<string>();
    for (const event of events) {
      if (event.type === 'wallBounce' || event.type === 'groundBounce') {
        bouncedThisFrame.add(event.fighterId);
      }
    }
    this.advanceFrameState(frozen, hitThisFrame, bouncedThisFrame, events);
    this.completedFrames += 1;
    return { state: this.read(), events };
  }

  public read(): WorldSnapshot {
    return {
      frame: this.completedFrames,
      fighters: this.fighters.map(snapshotFighter),
    };
  }

  public readDebugFrames(): readonly FighterDebugFrame[] {
    return this.fighters.map((fighter) => {
      const move =
        fighter.action === null ? undefined : this.moves.get(fighter.action.moveId);
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

  private validateInputs(inputs: CombatInputs): void {
    for (const fighter of this.fighters) {
      const moveId = inputs[fighter.id]?.move;
      if (moveId !== undefined && !this.moves.has(moveId)) {
        throw new Error(`Unknown move "${moveId}" for fighter "${fighter.id}"`);
      }
    }
  }

  private tryStartMove(
    fighter: MutableFighterState,
    input: CombatInputs[string],
    events: CombatEvent[],
  ): void {
    if (
      input?.move === undefined
      || fighter.health === 0
      || fighter.hitstun > 0
      || fighter.action !== null
    ) {
      return;
    }
    fighter.action = {
      moveId: input.move,
      frame: 0,
      serial: this.nextActionSerial,
      hitLedger: [],
    };
    this.nextActionSerial += 1;
    events.push({
      type: 'moveStarted',
      frame: this.completedFrames,
      fighterId: fighter.id,
      moveId: input.move,
    });
  }

  private advanceFrameState(
    frozen: ReadonlySet<string>,
    hitThisFrame: ReadonlySet<string>,
    bouncedThisFrame: ReadonlySet<string>,
    events: CombatEvent[],
  ): void {
    for (const fighter of this.fighters) {
      if (frozen.has(fighter.id)) {
        continue;
      }
      if (
        fighter.hitstun > 0
        && !hitThisFrame.has(fighter.id)
        && !bouncedThisFrame.has(fighter.id)
      ) {
        fighter.hitstun -= 1;
      }
      const action = fighter.action;
      if (action === null || fighter.hitstop > 0) {
        continue;
      }
      action.frame += 1;
      const move = this.moves.get(action.moveId);
      if (move !== undefined && action.frame >= totalMoveFrames(move)) {
        fighter.action = null;
        events.push({
          type: 'moveEnded',
          frame: this.completedFrames,
          fighterId: fighter.id,
          moveId: move.id,
        });
      }
    }
  }
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

function compareIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
