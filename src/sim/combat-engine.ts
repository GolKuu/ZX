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
import {
  faceAirborneFightersTowardOpponents,
  faceAttackingFightersTowardOpponents,
} from './facing.js';
import { effectiveMoveFrames, type MoveFrameData } from './frame-data.js';
import { integrateFighter } from './physics.js';
import { resolveMoveObstacles } from './move-obstacles.js';
import { resolveHit } from './resolve.js';
import { advanceKnockdown } from './knockdown.js';
import {
  applyMovingWallHits,
  applyWallAttackContacts,
  resolveWallCollisions,
  updateWallRun,
  WallField,
} from './walls/index.js';
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
  private readonly walls = new WallField();
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

    faceAttackingFightersTowardOpponents(this.fighters, inputs);
    for (const fighter of this.fighters) {
      advanceMoveCooldowns(fighter);
      if (fighter.knockdownCooldownFrames > 0) {
        fighter.knockdownCooldownFrames -= 1;
      }
      fighter.previousPosition.x = fighter.position.x;
      fighter.previousPosition.y = fighter.position.y;
      if (fighter.hitstop > 0) {
        fighter.hitstop -= 1;
        frozen.add(fighter.id);
        continue;
      }
      applyNeutralInput(fighter, inputs[fighter.id]);
      advanceDefensiveResources(fighter, this.moves);
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
      applyAuthoredDisplacement(fighter, this.moves, this.config.groundY);
      integrateFighter(fighter, this.config, this.completedFrames, events);
    }

    this.advanceWalls(inputs, events);
    resolveMoveObstacles(this.fighters, this.moves);
    faceAirborneFightersTowardOpponents(this.fighters);
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
      const outcome = resolveHit(
        candidate,
        this.completedFrames,
        this.config.maximumVelocity,
        events,
        { nextSerial: this.nextActionSerial },
      );
      if (outcome.startedAction) this.nextActionSerial += 1;
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
    return readWorld(this.completedFrames, this.fighters, this.walls.read());
  }

  /** Round transitions clear the arena; nothing survives into the next round. */
  public clearWalls(): void {
    this.walls.clear();
    for (const fighter of this.fighters) {
      fighter.wallRun = { phase: 'none', wallId: null, frame: 0, climb: 0 };
    }
  }

  /**
   * Planes are created, aged and resolved in one place, after movement and
   * before hit detection, so a plane that appears this frame cannot retroactively
   * block a blow that already connected.
   */
  private advanceWalls(inputs: CombatInputs, events: CombatEvent[]): void {
    const before = new Set(this.walls.entities.map((wall) => wall.id));
    this.walls.spawnFromMoves(this.fighters, this.moves);
    for (const wall of this.walls.entities) {
      if (before.has(wall.id)) continue;
      events.push({
        type: 'wallSpawned',
        frame: this.completedFrames,
        wallId: wall.id,
        ownerId: wall.ownerId,
        kind: wall.kind,
        position: { ...wall.center },
      });
    }
    const mounting = this.walls.applyCommands(this.fighters, this.moves);
    this.walls.tick(this.config.leftWall, this.config.rightWall);
    applyWallAttackContacts(
      this.walls,
      this.fighters,
      this.moves,
      this.completedFrames,
      events,
    );
    applyMovingWallHits(
      this.walls,
      this.fighters,
      this.completedFrames,
      this.config.maximumVelocity,
      events,
    );
    resolveWallCollisions(
      this.walls,
      this.fighters,
      this.completedFrames,
      events,
    );
    for (const fighter of this.fighters) {
      if (fighter.hitstop > 0) continue;
      const input = inputs[fighter.id];
      updateWallRun(
        fighter,
        this.walls,
        {
          mount: input?.wallMount === true || mounting.has(fighter.id),
          climb: input?.wallClimb ?? 0,
          jump: input?.wallJump === true,
          exit: input?.wallExit ?? 0,
        },
        this.completedFrames,
        events,
      );
      if (fighter.health === 0) this.walls.removeOwnedBy(fighter.id);
    }
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
        if (fighter.hitstun === 0) fighter.comboHitsTaken = 0;
      }
      advanceKnockdown(fighter, hitThisFrame.has(fighter.id));
      const action = fighter.action;
      if (action === null || fighter.hitstop > 0) {
        continue;
      }
      action.frame += 1;
      const move = this.moves.get(action.moveId);
      // Frame Inertia and anything else that shortens recovery lands here, so
      // the move genuinely ends earlier rather than merely looking like it.
      const tierRecovery = fighter.resource
        >= (fighter.resourceRules?.highRageThreshold ?? 101)
        ? fighter.resourceRules?.recoveryPercentAtHighRage ?? 100
        : 100;
      const recoveryPercent = Math.ceil(
        fighter.recoveryPercent * tierRecovery / 100,
      );
      const length = move === undefined
        ? 0
        : effectiveMoveFrames(move, recoveryPercent);
      if (move !== undefined && action.frame >= length) {
        events.push({
          type: 'moveEnded',
          frame: this.completedFrames,
          fighterId: fighter.id,
          moveId: move.id,
        });
        const whiff = action.hitLedger.length === 0
          ? move.onWhiffFollowUp
          : undefined;
        if (whiff === undefined) {
          fighter.action = null;
        } else {
          fighter.action = {
            moveId: whiff,
            frame: 0,
            serial: this.nextActionSerial,
            hitLedger: [],
            armourHitsUsed: 0,
          };
          this.nextActionSerial += 1;
          events.push({
            type: 'moveStarted',
            frame: this.completedFrames,
            fighterId: fighter.id,
            moveId: whiff,
          });
        }
      }
    }
  }
}

function advanceMoveCooldowns(fighter: MutableFighterState): void {
  for (const moveId of Object.keys(fighter.moveCooldowns)) {
    const remaining = (fighter.moveCooldowns[moveId] ?? 0) - 1;
    if (remaining <= 0) delete fighter.moveCooldowns[moveId];
    else fighter.moveCooldowns[moveId] = remaining;
  }
}

function applyAuthoredDisplacement(
  fighter: MutableFighterState,
  moves: ReadonlyMap<string, MoveFrameData>,
  groundY: number,
): void {
  const action = fighter.action;
  if (action === null) return;
  const displacement = moves.get(action.moveId)?.displacements?.find(
    (entry) => entry.frame === action.frame,
  );
  if (displacement === undefined) return;
  fighter.position.x += displacement.offset.x * fighter.facing;
  fighter.position.y = Math.max(
    fighter.position.y + displacement.offset.y,
    groundY,
  );
  if (displacement.offset.y !== 0) fighter.grounded = false;
  if (displacement.clearVelocity === true) {
    fighter.velocity.x = 0;
    fighter.velocity.y = 0;
  }
}

function advanceDefensiveResources(
  fighter: MutableFighterState,
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  if (fighter.resourceLockFrames > 0) fighter.resourceLockFrames -= 1;
  if (fighter.guarding) {
    fighter.guardFrames += 1;
  } else {
    fighter.guardFrames = 0;
    fighter.guardHealth = Math.min(100, fighter.guardHealth + 1);
  }
  if (fighter.statusFrames > 0) {
    fighter.statusFrames -= 1;
    const status = [...moves.values()].find(
      (move) => move.status?.id === fighter.statusId,
    )?.status;
    const drainEvery = status?.resourceDrainIntervalFrames ?? 0;
    if (drainEvery > 0) {
      fighter.statusResourceDrainCounter += 1;
      if (fighter.statusResourceDrainCounter >= drainEvery) {
        fighter.statusResourceDrainCounter = 0;
        fighter.resource = Math.max(
          0,
          fighter.resource - (status?.resourceDrainAmount ?? 0),
        );
      }
    }
    if (fighter.statusFrames === 0) {
      fighter.statusId = null;
      fighter.recoveryPercent = 100;
      fighter.statusArmourHitsUsed = 0;
    }
  }
  if (fighter.resourceOverdrive) {
    fighter.resourceDrainCounter += 1;
    const interval = fighter.resourceRules?.overdriveDrainIntervalFrames ?? 1;
    if (fighter.resourceDrainCounter >= interval) {
      fighter.resourceDrainCounter = 0;
      fighter.resource = Math.max(0, fighter.resource - 1);
    }
    if (fighter.resource < 75) fighter.resourceOverdrive = false;
  }
}

function compareIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
