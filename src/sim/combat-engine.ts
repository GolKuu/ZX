import type { CombatWorldConfig } from './config.js';
import { copyMove, copyWorldConfig, createFighterState } from './copy.js';
import { collectHitCandidates, contactKey } from './detection.js';
import {
  applyNeutralInput,
  tryStartMove,
  validateCombatInputs,
} from './engine-input.js';
import {
  readDebugFrames as createDebugFrames,
  readWorld,
} from './engine-read.js';
import type { CombatEvent, FighterDebugFrame } from './events.js';
import { totalMoveFrames, type MoveFrameData } from './frame-data.js';
import { integrateFighter } from './physics.js';
import { resolveHit } from './resolve.js';
import type {
  CombatInputs,
  FighterDefinition,
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
    validateCombatInputs(this.fighters, this.moves, inputs);
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
      applyNeutralInput(fighter, inputs[fighter.id]);
      const started = tryStartMove(
        fighter,
        inputs[fighter.id],
        this.moves,
        this.nextActionSerial,
        this.completedFrames,
      );
      if (started !== null) {
        this.nextActionSerial += 1;
        events.push(started);
      }
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
    return readWorld(this.completedFrames, this.fighters);
  }

  public readDebugFrames(): readonly FighterDebugFrame[] {
    return createDebugFrames(this.fighters, this.moves);
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

function compareIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
